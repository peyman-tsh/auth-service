// src/auth/guards/jwt-auth.guard.ts

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * بررسی می‌کند آیا درخواست می‌تواند به endpoint دسترسی داشته باشد
   * اگر endpoint با دکوراتور Public مشخص شده باشد، نیازی به احراز هویت ندارد
   * @param context اطلاعات درخواست
   */
  canActivate(context: ExecutionContext) {
    // بررسی آیا endpoint عمومی است
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // اگر endpoint عمومی است، اجازه دسترسی بدون احراز هویت
    if (isPublic) {
      return true;
    }
    
    // در غیر این صورت، بررسی توکن JWT
    return super.canActivate(context);
  }

  /**
   * مدیریت نتیجه احراز هویت
   * @param err خطای احتمالی
   * @param user اطلاعات کاربر احراز هویت شده
   */
  handleRequest(err, user, info) {
    // اگر خطا رخ داده یا کاربر یافت نشده، خطای UnauthorizedException ارسال می‌شود
    if (err || !user) {
      throw err || new UnauthorizedException('لطفاً وارد حساب کاربری خود شوید');
    }
    return user;
  }
}