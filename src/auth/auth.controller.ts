import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PubService } from './pub.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UseCircuitBreaker } from '@/circuit-breaker/interceptors/circuit-breaker.interceptor';

@Controller()
export class AuthController {
  constructor(
    private readonly pubservice: PubService,
  ) {}

  @MessagePattern({ cmd: 'authenticate' })
  @UseCircuitBreaker()
  async login(@Payload() loginDto: LoginDto) {
    console.log(loginDto);
    return 'ok'
    // return this.pubservice.login(loginDto);
  }

  @MessagePattern({ cmd: 'register' })
  // @UseCircuitBreaker()
  async register(@Payload() registerDto: RegisterDto) {
    return this.pubservice.register(registerDto);
  }

  @MessagePattern({ cmd: 'validate_token' })
  @UseCircuitBreaker()
  async validateToken(@Payload() token: string) {
    return this.pubservice.validateToken(token);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  @UseCircuitBreaker()
  async refreshToken(@Payload() data: { userId: string; refreshToken: string }) {
    return this.pubservice.refreshToken(data.userId, data.refreshToken);
  }

  @MessagePattern({ cmd: 'logout' })
  @UseCircuitBreaker()
  async logout(@Payload() userId: string) {
    return this.pubservice.logout(userId);
  }
} 