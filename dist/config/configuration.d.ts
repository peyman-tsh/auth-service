declare const _default: () => {
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        retryStrategy: (times: number) => number;
        maxRetriesPerRequest: number;
        enableReadyCheck: boolean;
        connectTimeout: number;
        lazyConnect: boolean;
    };
    microservices: {
        user: {
            host: string;
            port: number;
        };
    };
    application: {
        port: number;
        environment: string;
    };
};
export default _default;
