import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly userServiceClient: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    const rabbitmqUrl = this.configService.get('rabbitmq.url') || 'amqp://localhost:5672';

    this.userServiceClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'user_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async sendToUserService(pattern: string, data: any) {
    return this.userServiceClient.send(pattern, data).toPromise();
  }

  async onModuleDestroy() {
    await this.userServiceClient.close();
  }
} 