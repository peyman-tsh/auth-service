// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@app/shared/common/enum/user.role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * بررسی می‌کند آیا کاربر نقش‌های مورد نیاز برای دسترسی به endpoint را دارد
   * @param context اطلاعات درخواست
   */
  canActivate(context: ExecutionContext): boolean {
    // دریافت نقش‌های مورد نیاز برای endpoint
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // اگر نقش خاصی مشخص نشده باشد، همه کاربران دسترسی دارند
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // دریافت اطلاعات کاربر از درخواست
    const { user } = context.switchToHttp().getRequest();
    
    // اگر کاربر یا نقش‌های کاربر وجود نداشته باشد، دسترسی رد می‌شود
    if (!user || !user.roles) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }
    
    // بررسی آیا کاربر حداقل یکی از نقش‌های مورد نیاز را دارد
    const hasRequiredRole = requiredRoles.some((role) => 
      user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      throw new ForbiddenException('شما دسترسی لازم برای این عملیات را ندارید');
    }
    
    return true;
  }
}