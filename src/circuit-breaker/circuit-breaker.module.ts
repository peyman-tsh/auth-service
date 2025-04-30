import { Module } from '@nestjs/common';
import { CircuitBreakerInterceptor } from './interceptors/circuit-breaker.interceptor';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [CircuitBreakerInterceptor],
  exports: [CircuitBreakerInterceptor],
})
export class CircuitBreakerModule {} 