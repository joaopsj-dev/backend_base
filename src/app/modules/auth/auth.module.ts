import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { JwtServiceCustom } from './jwt.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy, JwtServiceCustom],
  controllers: [AuthController],
  exports: [JwtServiceCustom],
})
export class AuthModule {}
