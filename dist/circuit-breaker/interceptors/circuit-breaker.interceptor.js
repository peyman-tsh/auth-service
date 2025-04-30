"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const opossum_1 = require("opossum");
let CircuitBreakerInterceptor = class CircuitBreakerInterceptor {
    constructor() {
        this.circuitBreakers = new Map();
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const serviceName = request.url.split('/')[1];
        const key = `circuit:${serviceName}`;
        let circuit = this.circuitBreakers.get(key);
        if (!circuit) {
            circuit = new opossum_1.default(async () => {
                return next.handle().toPromise();
            }, {
                timeout: 3000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                rollingCountTimeout: 10000,
                rollingCountBuckets: 10,
                name: key,
            });
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
            return new rxjs_1.Observable(subscriber => {
                subscriber.next(result);
                subscriber.complete();
            });
        }
        catch (error) {
            if (error.name === 'CircuitBreakerOpenError') {
                throw new common_1.BadGatewayException('Service is temporarily unavailable');
            }
            return (0, rxjs_1.throwError)(() => error);
        }
    }
};
exports.CircuitBreakerInterceptor = CircuitBreakerInterceptor;
exports.CircuitBreakerInterceptor = CircuitBreakerInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CircuitBreakerInterceptor);
//# sourceMappingURL=circuit-breaker.interceptor.js.map