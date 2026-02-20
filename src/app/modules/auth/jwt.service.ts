import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/entities/user.entity';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class JwtServiceCustom {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: Number(this.config.get<string>('JWT_ACCESS_EXPIRES_IN_MS')),
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(this.config.get<string>('JWT_REFRESH_EXPIRES_IN_MS')),
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Token Inválido');
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Token Inválido');
    }
  }
}
