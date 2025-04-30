"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIRCUIT_BREAKER_OPTIONS = void 0;
exports.CircuitBreaker = CircuitBreaker;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
exports.CIRCUIT_BREAKER_OPTIONS = 'CIRCUIT_BREAKER_OPTIONS';
function CircuitBreaker(options = {}) {
    return (0, common_1.applyDecorators)((0, common_2.SetMetadata)(exports.CIRCUIT_BREAKER_OPTIONS, {
        timeout: options.timeout || 5000,
        failureThreshold: options.failureThreshold || 5,
        resetTimeout: options.resetTimeout || 60000,
        fallback: options.fallback,
    }));
}
//# sourceMappingURL=circuit-breaker.decorator.js.map