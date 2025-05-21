import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { PubService } from './pub.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ClientsModule,Transport } from '@nestjs/microservices';
import configuration from '@/config/configuration';
import { APP_FILTER } from '@nestjs/core';
import { RpcExceptionFilter } from './exceptions/exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({
      load:[configuration]
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      }
    ]),
  ],
  controllers: [AuthController],
  providers: [PubService, LocalStrategy, JwtStrategy,
    {
      provide:APP_FILTER,
      useClass:RpcExceptionFilter
    }
  ],
  exports: [PubService],
})
export class AuthModule {} 