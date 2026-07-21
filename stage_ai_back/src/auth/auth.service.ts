import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByCredentials(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id + '-' + Date.now(),
    };
  }
}