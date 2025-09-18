// src/auth/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * کلید متادیتا برای مشخص کردن endpoint‌های عمومی
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * دکوراتور Public برای مشخص کردن endpoint‌هایی که نیاز به احراز هویت ندارند
 * @example
 * @Public()
 * @Get('health')
 * checkHealth() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);