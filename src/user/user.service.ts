import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
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
  }: CreateUserDto): Promise<RegisterResponse> {
    const hashedPassword = await hash(password, 10);
    const user = await this.dbService.user.create({
      data: { username, password: hashedPassword },
    });

    const token = await this.jwtService.signAsync({ id: user.id });
    return { token };
  }
}
