import { IsString, IsAlphanumeric, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsAlphanumeric()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(7)
  password: string;
}
