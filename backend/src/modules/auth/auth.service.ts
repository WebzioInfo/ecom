import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = randomBytes(24).toString('hex');

    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    const payload = {
      sub: (newUser._id as any).toString(),
      email: newUser.email,
      roles: newUser.roles,
      type: 'STORE_ADMIN',
    };
    
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m') as any,
    });
    
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d') as any,
    });

    return {
      access_token,
      refresh_token,
      verificationToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: (user._id as any).toString(), 
      email: user.email, 
      roles: user.roles,
      type: 'STORE_ADMIN', 
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m') as any,
    });
    
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '30d') as any,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'STORE_ADMIN') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or account is suspended');
      }

      const newPayload = {
        sub: (user._id as any).toString(),
        email: user.email,
        roles: user.roles,
        type: 'STORE_ADMIN',
      };

      const access_token = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m') as any,
      });

      return {
        access_token,
        token_type: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No account registered with this email');
    }

    const resetToken = randomBytes(24).toString('hex');
    const resetTokenExpiration = new Date(Date.now() + 1000 * 60 * 30);
    await this.usersService.updateProfile(user._id.toString(), {
      resetToken,
      resetTokenExpiration,
    });

    return {
      message:
        'Password reset requested. Use the provided token to reset your password.',
      resetToken,
    };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.usersService.findByResetToken(token);
    if (
      !user ||
      !user.resetTokenExpiration ||
      user.resetTokenExpiration < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.updateProfile(user._id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiration: undefined,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.usersService.updateProfile(user._id.toString(), {
      isVerified: true,
      verificationToken: undefined,
    });
    return { message: 'Email verified successfully' };
  }
}
