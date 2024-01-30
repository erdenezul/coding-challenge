import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { LoginDto, LoginResponse } from './dto/login.dto';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/interfaces/config.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Returns jwt token if credential is valid
   * @behavior
   * 1. Returns jwt token for given credential
   * 2. If the credential is invalid, it should return error
   * 3. If somebody is already logged in with the same credentials, it should
   *    throw an error
   *
   * @returns
   */
  async login({ username, password }: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.dbService.user.findFirstOrThrow({
        where: { username },
        include: { session: true },
      });

      /**
       * Unhappy path for invalid password
       */
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Password is not valid');
      }

      /**
       * Unhappy path for existing login session
       */
      if (user.session && user.session.expires_at > new Date()) {
        throw new HttpException(
          'There is already an active session using your account',
          HttpStatus.CONFLICT,
        );
      }

      const jwtConfig = this.configService.get<JwtConfig>('jwt');
      const expiresAt = dayjs().add(jwtConfig.expiresIn, 'seconds').toDate();

      await this.dbService.session.upsert({
        where: {
          id: user?.session?.id ?? '',
        },
        create: {
          user_id: user.id,
          expires_at: expiresAt,
        },
        update: {
          expires_at: expiresAt,
        },
      });

      const token = await this.jwtService.signAsync({ id: user.id });

      return { token };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('No user found', HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
