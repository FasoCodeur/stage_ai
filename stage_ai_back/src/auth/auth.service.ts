import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailerService } from '../common/mailer/mailer.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByCredentials(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Met à jour la date de dernière connexion
    const lastLogin = new Date().toISOString().split('T')[0];
    await this.usersService.update(user.id, { lastLogin });

    const { password, ...userWithoutPassword } = user;
    return {
      user: { ...userWithoutPassword, lastLogin },
      token: 'mock-jwt-token-' + user.id + '-' + Date.now(),
    };
  }

  /**
   * Envoie un email de réinitialisation si le compte existe.
   * On renvoie toujours le même message pour ne pas révéler les emails inscrits.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const result = await this.usersService.createPasswordResetToken(dto.email);

    if (result) {
      const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
      const resetUrl = `${appUrl}/reset-password?token=${result.token}`;
      await this.mailerService.sendPasswordReset(result.user.email, result.user.name, resetUrl);
    }

    return {
      message:
        'Si un compte existe avec cette adresse, un email contenant un lien de réinitialisation vient d’être envoyé.',
    };
  }

  /**
   * Réinitialise le mot de passe à partir du jeton reçu par email.
   */
  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.token) {
      throw new BadRequestException('Jeton manquant');
    }
    return this.usersService.resetPasswordWithToken(dto.token, dto.newPassword);
  }
}
