import {
  Controller,
  Post,
  Body,
  UsePipes,
  Req,
  UnauthorizedException,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { loginSchema, LoginDto } from './dto/login.dto';
import { ZodValidationPipe } from 'src/app/common/pipes/zod-validation.pipe';
import { JwtPayload, JwtServiceCustom } from './jwt.service';
import { Request, Response } from 'express';
import { RegisterDto, registerSchema } from './dto/register.dto';
import {
  ApiMe,
  ApiLogin,
  ApiRegister,
  ApiRefresh,
  ApiLogout,
} from './auth.swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export type AuthRequest = Request & { user: JwtPayload };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtServiceCustom,
  ) {}

  @Get('me')
  @ApiMe()
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthRequest) {
    return this.authService.me(req.user.sub);
  }

  @Post('login')
  @ApiLogin()
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.login(data);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRES_IN_MS),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS),
    });

    return { success: true };
  }

  @Post('register')
  @ApiRegister()
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.register(data);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRES_IN_MS),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS),
    });

    return { success: true };
  }

  @Post('refresh')
  @ApiRefresh()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    const { access_token, refresh_token } =
      await this.authService.refreshTokens(payload.sub);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRES_IN_MS),
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS),
    });

    return { success: true };
  }

  @Post('logout')
  @ApiLogout()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logout realizado' };
  }
}
