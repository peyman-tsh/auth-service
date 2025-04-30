import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class CircuitBreakerInterceptor implements NestInterceptor {
    private readonly circuitBreakers;
    constructor();
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
