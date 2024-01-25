import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'happyUser' })
  username: string;

  @ApiProperty({ example: 'iTk19!n' })
  @IsString()
  password: string;
}

export class LoginResponse {
  token: string;
}
