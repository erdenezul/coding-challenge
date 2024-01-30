import { SetMetadata } from '@nestjs/common';
import { Role } from '../typedefs/role.enum';

export const ROLES_KEY = 'roles';
/**
 * Decides which role should be applied to controller
 * @param roles {Role}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
