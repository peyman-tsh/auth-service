export interface CircuitBreakerOptions {
    timeout?: number;
    failureThreshold?: number;
    resetTimeout?: number;
    fallback?: (...args: any[]) => Promise<any>;
}
export declare const CIRCUIT_BREAKER_OPTIONS = "CIRCUIT_BREAKER_OPTIONS";
export declare function CircuitBreaker(options?: CircuitBreakerOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
