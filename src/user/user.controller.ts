import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto } from './dto';
import { RegisterResponse } from './interfaces/user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private users = [];

  constructor(private readonly service: UserService) {}

  @Public()
  @Post()
  async register(@Body() payload: CreateUserDto): Promise<RegisterResponse> {
    return this.service.register(payload);
  }
}
