import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '@/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await firstValueFrom(
        this.userClient.send({ cmd: 'validate_user' }, loginDto)
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await firstValueFrom(
        this.userClient.send({ cmd: 'create_user' }, registerDto)
      );

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }
  
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await firstValueFrom(
        this.userClient.send({ cmd: 'get_user' }, { id: payload.sub })
      );

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'get_user' }, { id: userId })
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(userId, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.redisService.del(`refresh_token:${userId}`);
    return { message: 'Successfully logged out' };
  }

  private async generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redisService.set(`refresh_token:${userId}`, refreshToken, ttl);
  }

  async validateUserById(userId: string) {
    try {
      const user = await firstValueFrom(
        this.userClient.send({ cmd: 'get_user' }, { id: userId })
      );
      return user;
    } catch (error) {
      return null;
    }
  }
} 