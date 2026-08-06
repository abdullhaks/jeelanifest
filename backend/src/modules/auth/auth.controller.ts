import {
  Controller,
  Post,
  Patch,
  Body,
  Res,
  Req,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, changePasswordSchema } from './auth.schemas';
import type { LoginDto, ChangePasswordDto } from './auth.schemas';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    // Set refresh token as httpOnly cookie
    this.setRefreshCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      admin: result.admin,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No refresh token' });
      return;
    }

    const result = await this.authService.refresh(refreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the refresh cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      domain: this.configService.get<string>('COOKIE_DOMAIN', 'localhost'),
      path: '/',
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: this.configService.get<string>('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none',
    });

    return { message: 'Logged out successfully' };
  }

  @Patch('change-password')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    const adminId = (req as any).admin.sub;
    return this.authService.changePassword(adminId, dto);
  }

  /**
   * Protected test route — used to verify AuthGuard works.
   * Will be removed or repurposed in a later phase.
   */
  @Get('protected-test')
  @UseGuards(AuthGuard)
  protectedTest(@Req() req: Request) {
    return {
      message: 'You have access!',
      admin: (req as any).admin,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    const isSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    const sameSite = this.configService.get<string>('COOKIE_SAMESITE', 'lax') as 'lax' | 'strict' | 'none';
    const domain = this.configService.get<string>('COOKIE_DOMAIN', 'localhost');

    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
