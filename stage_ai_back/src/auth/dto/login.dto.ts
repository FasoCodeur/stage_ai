import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@stageia.com', description: 'Email de connexion' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Mot de passe' })
  @IsString()
  password: string;
}