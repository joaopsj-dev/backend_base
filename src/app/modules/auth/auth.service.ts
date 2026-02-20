import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtServiceCustom } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import { emailQueue } from 'src/app/modules/email/email.queue';
import { jobs } from 'src/app/common/rules/jobs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtServiceCustom,
    private readonly config: ConfigService,
  ) {}

  async me(id: string) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(data: LoginDto) {
    const user = await this.userRepo.findOneBy({ email: data.email });
    if (!user) {
      throw new UnauthorizedException({
        field: 'email',
        message: 'Email inválido',
      });
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        field: 'password',
        message: 'Senha inválida',
      });
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = await this.jwtService.generateAccessToken(payload);
    const refresh_token = await this.jwtService.generateRefreshToken(payload);

    return { access_token, refresh_token };
  }

  async register(data: RegisterDto) {
    const userByEmail = await this.userRepo.findOneBy({ email: data.email });
    if (userByEmail) {
      throw new ConflictException({
        field: 'email',
        message: 'Email já cadastrado',
      });
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      +this.config.get<string>('BCRYPT_HASH_SALT')!,
    );

    const user = await this.userRepo.save({
      ...data,
      password: hashedPassword,
    });

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = await this.jwtService.generateAccessToken(payload);
    const refresh_token = await this.jwtService.generateRefreshToken(payload);

    await emailQueue.add(
      jobs.send_email.name,
      {
        to: user.email,
        subject: 'Bem vindo',
        text: `Olá ${user.name}, sua conta foi criada com sucesso!`,
      },
      jobs.send_email.options,
    );

    return { access_token, refresh_token };
  }

  async refreshTokens(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
    };

    const newAccessToken = await this.jwtService.generateAccessToken(payload);
    const newRefreshToken = await this.jwtService.generateRefreshToken(payload);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
