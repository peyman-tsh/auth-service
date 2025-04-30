import { Module } from '@nestjs/common';
import { CircuitBreakerInterceptor } from './interceptors/circuit-breaker.interceptor';

@Module({
  providers: [CircuitBreakerInterceptor],
  exports: [CircuitBreakerInterceptor],
})
export class CircuitBreakerModule {} 