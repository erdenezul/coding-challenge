import {
  IsString,
  IsAlphanumeric,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '../../auth/typedefs/role.enum';

export enum UserRole {
  Buyer = 'Buyer',
  Seller = 'Seller',
}
export class CreateUserDto {
  @IsAlphanumeric()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(7)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
