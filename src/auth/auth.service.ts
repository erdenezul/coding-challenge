import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { LoginDto, LoginResponse } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.dbService.user.findFirstOrThrow({
        where: { username },
      });
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Password is not valid');
      }
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
