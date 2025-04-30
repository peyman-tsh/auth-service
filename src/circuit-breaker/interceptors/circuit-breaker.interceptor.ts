import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CIRCUIT_BREAKER_OPTIONS, CircuitBreakerOptions } from '../decorators/circuit-breaker.decorator';
import { Redis } from 'ioredis';

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly redis: Redis;

  constructor(
    @Inject('REDIS_CLIENT') redis: Redis,
    private readonly reflector: Reflector,
  ) {
    this.redis = redis;
  }

  private getKey(context: ExecutionContext): string {
    const [className, methodName] = [
      context.getClass().name,
      context.getHandler().name,
    ];
    return `circuit:${className}:${methodName}`;
  }

  private async getState(key: string): Promise<CircuitState> {
    const state = await this.redis.get(key);
    return state
      ? JSON.parse(state)
      : {
          failures: 0,
          lastFailureTime: 0,
          state: 'CLOSED',
        };
  }

  private async setState(key: string, state: CircuitState): Promise<void> {
    await this.redis.setex(key, 3600, JSON.stringify(state)); // 1 hour TTL
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const options = this.reflector.get<CircuitBreakerOptions>(
      CIRCUIT_BREAKER_OPTIONS,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const key = this.getKey(context);
    const state = await this.getState(key);
    const now = Date.now();

    if (state.state === 'OPEN') {
      if (now - state.lastFailureTime >= options.resetTimeout) {
        state.state = 'HALF_OPEN';
        await this.setState(key, state);
      } else if (options.fallback) {
        return new Observable((subscriber) => {
          options.fallback()
            .then((result) => {
              subscriber.next(result);
              subscriber.complete();
            })
            .catch((error) => {
              subscriber.error(error);
            });
        });
      } else {
        return throwError(() => new Error('Circuit breaker is open'));
      }
    }

    return next.handle().pipe(
      timeout(options.timeout),
      catchError(async (error) => {
        state.failures++;
        state.lastFailureTime = now;

        if (state.failures >= options.failureThreshold) {
          state.state = 'OPEN';
        } else if (state.state === 'HALF_OPEN') {
          state.state = 'OPEN';
        }

        await this.setState(key, state);

        if (options.fallback) {
          return new Observable((subscriber) => {
            options.fallback()
              .then((result) => {
                subscriber.next(result);
                subscriber.complete();
              })
              .catch((fallbackError) => {
                subscriber.error(fallbackError);
              });
          });
        }

        return throwError(() => error);
      }),
    );
  }
} 