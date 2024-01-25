import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, LoginResponse } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

@Controller('/login')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post()
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Log in a user' })
  @ApiTags('auth')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponse })
  async login(@Body() payload: LoginDto): Promise<LoginResponse> {
    return this.service.login(payload);
  }
}
