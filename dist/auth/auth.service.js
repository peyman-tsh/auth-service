"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
let AuthService = class AuthService {
    constructor(jwtService, configService, rabbitmqService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.rabbitmqService = rabbitmqService;
    }
    async login(loginDto) {
        try {
            const user = await this.rabbitmqService.sendToUserService('validateUser', loginDto);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
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
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async register(registerDto) {
        try {
            const user = await this.rabbitmqService.sendToUserService('createUser', registerDto);
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
        catch (error) {
            throw error;
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret'),
            });
            const user = await this.validateUserById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException();
            }
            return {
                id: user.id,
                email: user.email,
                role: user.role,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
    async refreshToken(userId, refreshToken) {
        const user = await this.validateUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = await this.generateTokens(user);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async logout(userId) {
        return { message: 'Successfully logged out' };
    }
    async generateTokens(user) {
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
    async validateUser(username, password) {
        const user = await this.rabbitmqService.sendToUserService('validateUser', {
            username,
            password,
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async validateUserById(userId) {
        try {
            const user = await this.rabbitmqService.sendToUserService('getUser', { id: userId });
            return user;
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        rabbitmq_service_1.RabbitMQService])
], AuthService);
//# sourceMappingURL=auth.service.js.map