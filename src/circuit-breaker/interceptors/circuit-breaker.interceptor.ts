import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly circuitBreakers: Map<string, CircuitBreaker>;

  constructor() {
    this.circuitBreakers = new Map();
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const serviceName = request.url.split('/')[1];
    const key = `circuit:${serviceName}`;

    // Get or create circuit breaker for this service
    let circuit = this.circuitBreakers.get(key);
    if (!circuit) {
      circuit = new CircuitBreaker(
        async () => {
          return next.handle().toPromise();
        },
        {
          timeout: 3000, // 3 seconds
          errorThresholdPercentage: 50,
          resetTimeout: 30000, // 30 seconds
          rollingCountTimeout: 10000, // 10 seconds
          rollingCountBuckets: 10,
          name: key,
        }
      );

      // Handle circuit breaker events
      circuit.on('open', () => {
        console.log(`Circuit breaker for ${key} is open`);
      });

      circuit.on('halfOpen', () => {
        console.log(`Circuit breaker for ${key} is half-open`);
      });

      circuit.on('close', () => {
        console.log(`Circuit breaker for ${key} is closed`);
      });

      this.circuitBreakers.set(key, circuit);
    }

    try {
      const result = await circuit.fire();
      return new Observable(subscriber => {
        subscriber.next(result);
        subscriber.complete();
      });
    } catch (error) {
      if (error.name === 'CircuitBreakerOpenError') {
        throw new BadGatewayException('Service is temporarily unavailable');
      }
      return throwError(() => error);
    }
  }
} 