import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.schema';
import type { LoginDto, ChangePasswordDto } from './auth.schemas';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Seed the admin user on module init if none exists.
   * Password is hashed with bcrypt before storing.
   */
  async onModuleInit() {
    const existingAdmin = await this.adminModel.findOne().exec();
    if (!existingAdmin) {
      const username = this.configService.get<string>('SEED_ADMIN_USERNAME', 'admin');
      const password = this.configService.get<string>('SEED_ADMIN_PASSWORD', 'admin123');
      const hashedPassword = await bcrypt.hash(password, 12);
      await this.adminModel.create({ username, password: hashedPassword });
      console.log(`🌱 Seeded admin user: ${username}`);
    }
  }

  /**
   * Validate credentials and return access + refresh tokens.
   */
  async login(dto: LoginDto) {
    const admin = await this.adminModel.findOne({ username: dto.username }).exec();
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin._id.toString(), username: admin.username };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      admin: { id: admin._id, username: admin.username },
    };
  }

  /**
   * Verify refresh token and issue a new access token.
   */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const admin = await this.adminModel.findById(payload.sub).exec();
      if (!admin) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: admin._id.toString(), username: admin.username },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
        },
      );

      return {
        accessToken: newAccessToken,
        admin: { id: admin._id, username: admin.username },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Change admin password. Validates current password first.
   */
  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminModel.findById(adminId).exec();
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    admin.password = await bcrypt.hash(dto.newPassword, 12);
    await admin.save();

    return { message: 'Password changed successfully' };
  }
}
