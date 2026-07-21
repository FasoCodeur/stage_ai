import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Amadou Diallo', description: 'Nom complet' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@stageia.com', description: 'Email de connexion' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Mot de passe' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.ETUDIANT, description: 'Rôle utilisateur' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'AD', description: 'Initiales pour l\'avatar' })
  @IsString()
  avatar: string;

  @ApiPropertyOptional({ example: '+221 77 000 00 01' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dakar' })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({ example: 'Bac+2' })
  @IsOptional()
  @IsString()
  niveau?: string;
}