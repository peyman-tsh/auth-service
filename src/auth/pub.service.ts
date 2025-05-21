import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class PubService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject("USER_SERVICE") private readonly userClient:ClientProxy
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userClient.send({cmd:'validateUser'}, loginDto).toPromise();

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);

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
      
      const user =await this.userClient.send({cmd:'createUser'}, registerDto).toPromise();
      if(user.error){
        return {
          status:user.error.statusCode,
          message:user.error.message
        }
      }
      console.log(user);
      
      const tokens = await this.generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      const user = await this.validateUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException();
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.log(error);
      
      throw new UnauthorizedException();
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.validateUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    return { message: 'Successfully logged out' };
  }

  private async generateTokens(user: any) {
    console.log(user);
    
    const payload = { 
      sub: user.id, 
      email: user.email,
      role: user.role 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userClient.send({cmd:'validateUser'}, {
      username,
      password,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUserById(userId: string): Promise<any> {
    try {
      const user = await this.userClient.send({cmd:"findById"},userId);
      return user;
    } catch (error) {
      return null;
    }
  }
} 