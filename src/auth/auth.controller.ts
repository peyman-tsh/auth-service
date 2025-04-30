import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CircuitBreakerInterceptor } from '@/circuit-breaker/interceptors/circuit-breaker.interceptor';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  @UseInterceptors(CircuitBreakerInterceptor)
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'register' })
  @UseInterceptors(CircuitBreakerInterceptor)
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'validate_token' })
  @UseInterceptors(CircuitBreakerInterceptor)
  async validateToken(@Payload() token: string) {
    return this.authService.validateToken(token);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  @UseInterceptors(CircuitBreakerInterceptor)
  async refreshToken(@Payload() data: { userId: string; refreshToken: string }) {
    return this.authService.refreshToken(data.userId, data.refreshToken);
  }

  @MessagePattern({ cmd: 'logout' })
  @UseInterceptors(CircuitBreakerInterceptor)
  async logout(@Payload() userId: string) {
    return this.authService.logout(userId);
  }
} 