import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RabbitMQService implements OnModuleDestroy {
    private readonly configService;
    private readonly userServiceClient;
    constructor(configService: ConfigService);
    sendToUserService(pattern: string, data: any): Promise<any>;
    onModuleDestroy(): Promise<void>;
}
