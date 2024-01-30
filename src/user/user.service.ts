import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { Role } from '../auth/typedefs/role.enum';
import { CreateUserDto } from './dto';
import { RegisterResponse } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: PrismaService,
  ) {}

  async register({
    username,
    password,
    role = Role.Buyer,
  }: CreateUserDto): Promise<RegisterResponse> {
    try {
      const hashedPassword = await hash(password, 10);
      const user = await this.dbService.user.create({
        data: { username, password: hashedPassword, role },
      });

      const token = await this.jwtService.signAsync({ id: user.id });
      return { token };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
