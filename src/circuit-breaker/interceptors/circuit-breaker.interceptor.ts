import * as CircuitBreaker from 'opossum';
import { Options } from 'opossum';


export const breakerOptions = {
  timeout: 3000, // Timeout in milliseconds
  errorThresholdPercentage: 50, // Error threshold to open the circuit
  resetTimeout: 5000, // Time to wait before attempting a reset
};

export function UseCircuitBreaker(options: Options = {}) {
  return function (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // Replace the method with a circuit breaker wrapper
    descriptor.value = async function (...args: any[]) {
      const circuitBreaker = new CircuitBreaker(
        // Use Reflect.apply to correctly bind `this` to the method
       async (...methodArgs) => Reflect.apply(originalMethod, this, methodArgs),
        options,
      );
      circuitBreaker.on('failure', (error) => console.error('Circuit Breaker Failure:', error.message));
      circuitBreaker.on('open', () => console.warn('Circuit Breaker is Open'));
      circuitBreaker.on('halfOpen', () => console.warn('Circuit Breaker is Half-Open'));
      circuitBreaker.on('close', () => console.log('Circuit Breaker is Closed'))

      try {
        // Execute the circuit breaker
        return await circuitBreaker.fire(...args);
      } catch (error) {
        console.error(
          `Circuit breaker error for ${propertyKey}:`,
          error.message,
        );
        return error;
      }
    };

    return descriptor;
  };
}