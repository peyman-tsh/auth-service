import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UseCircuitBreaker } from '../circuit-breaker/decorators/circuit-breaker.decorator';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  @UseCircuitBreaker()
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'register' })
  @UseCircuitBreaker()
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'validate_token' })
  @UseCircuitBreaker()
  async validateToken(@Payload() token: string) {
    return this.authService.validateToken(token);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  @UseCircuitBreaker()
  async refreshToken(@Payload() data: { userId: string; refreshToken: string }) {
    return this.authService.refreshToken(data.userId, data.refreshToken);
  }

  @MessagePattern({ cmd: 'logout' })
  @UseCircuitBreaker()
  async logout(@Payload() userId: string) {
    return this.authService.logout(userId);
  }
} 