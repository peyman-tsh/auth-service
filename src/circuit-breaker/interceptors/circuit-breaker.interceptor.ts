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

      // Provide a fallback
      circuitBreaker.fallback(() => ({
        status: 'error',
        message: 'Service temporarily unavailable. Please try again later.',
      }));

      try {
        // Execute the circuit breaker
        return await circuitBreaker.fire(...args);
      } catch (error) {
        console.error(
          `Circuit breaker error for ${propertyKey}:`,
          error.message,
        );
        throw error;
      }
    };

    return descriptor;
  };
}