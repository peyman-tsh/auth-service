import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly rabbitmqService;
    constructor(jwtService: JwtService, configService: ConfigService, rabbitmqService: RabbitMQService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    validateToken(token: string): Promise<{
        id: any;
        email: any;
        role: any;
    }>;
    refreshToken(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    validateUser(username: string, password: string): Promise<any>;
    validateUserById(userId: string): Promise<any>;
}
