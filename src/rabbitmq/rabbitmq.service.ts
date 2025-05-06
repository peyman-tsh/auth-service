import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, MessagePattern, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {;

  constructor(private readonly configService: ConfigService,
   @Inject("USER_SERVICE") private readonly userServiceClient:ClientProxy
  ) {
    // const rabbitmqUrl = this.configService.get('rabbitmq.url') || 'amqp://localhost:5672';

    // this.userServiceClient = ClientProxyFactory.create({
    //   transport: Transport.RMQ,
    //   options: {
    //     urls: [rabbitmqUrl],
    //     queue: 'user_queue',
    //     queueOptions: {
    //       durable: true,
    //     },
    //   },
    // });
  }

  async sendToUserService(pattern: string, data: any) {
    return await this.userServiceClient.emit({cmd:pattern}, data).toPromise();
  }

  async onModuleDestroy() {
    await this.userServiceClient.close();
  }
} 