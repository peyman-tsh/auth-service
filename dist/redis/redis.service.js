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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    constructor(redisClient, configService) {
        this.redisClient = redisClient;
        this.configService = configService;
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async set(key, value, ttl) {
        if (ttl) {
            await this.redisClient.setex(key, ttl, value);
        }
        else {
            await this.redisClient.set(key, value);
        }
    }
    async del(key) {
        await this.redisClient.del(key);
    }
    async incr(key) {
        return this.redisClient.incr(key);
    }
    async expire(key, seconds) {
        await this.redisClient.expire(key, seconds);
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default,
        config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map