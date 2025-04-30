"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-here',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
        expiresIn: process.env.JWT_EXPIRATION || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 10000,
        lazyConnect: true,
    },
    microservices: {
        user: {
            host: process.env.USER_SERVICE_HOST || 'localhost',
            port: parseInt(process.env.USER_SERVICE_PORT, 10) || 3001,
        },
    },
    application: {
        port: parseInt(process.env.PORT, 10) || 3000,
        environment: process.env.NODE_ENV || 'development',
    },
});
//# sourceMappingURL=configuration.js.map