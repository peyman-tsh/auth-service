import { applyDecorators } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export interface CircuitBreakerOptions {
  timeout?: number;
  failureThreshold?: number;
  resetTimeout?: number;
  fallback?: (...args: any[]) => Promise<any>;
}

export const CIRCUIT_BREAKER_OPTIONS = 'CIRCUIT_BREAKER_OPTIONS';

export function CircuitBreaker(options: CircuitBreakerOptions = {}) {
  return applyDecorators(
    SetMetadata(CIRCUIT_BREAKER_OPTIONS, {
      timeout: options.timeout || 5000,
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      fallback: options.fallback,
    }),
  );
} 