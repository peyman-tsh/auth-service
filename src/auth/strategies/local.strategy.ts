import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PubService } from '../pub.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly pubservice: PubService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const loginDto: LoginDto = { email, password };
    try {
      const result = await this.pubservice.login(loginDto);
      return result.message.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}