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
  @ApiOperation({
    summary: 'Log in user and return jwt token',
    description:
      'If somebody is already logged in with the same credentials, the user should be given a message "There is already an active session using your account".',
  })
  @ApiTags('auth')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponse })
  async login(@Body() payload: LoginDto): Promise<LoginResponse> {
    return this.service.login(payload);
  }
}
