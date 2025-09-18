// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@app/shared/common/enum/user.role.enum';

export const ROLES_KEY = 'roles';

/**
 * دکوراتور Roles برای تعیین نقش‌های مجاز برای دسترسی به endpoint
 * @param roles لیست نقش‌های مجاز
 * @example
 * @Roles(Role.Admin)
 * @Get('users')
 * findAll() {
 *   return this.usersService.findAll();
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);