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

  @ApiProperty({ example: 'admin123', description: 'Mot de passe (si vide, un mot de passe par défaut est généré et envoyé par email)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

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

  @ApiPropertyOptional({ description: "ID de l'entreprise (pour les tuteurs)" })
  @IsOptional()
  @IsString()
  entrepriseId?: string;

  @ApiPropertyOptional({ description: 'Date de dernière connexion (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  lastLogin?: string;

  @ApiPropertyOptional({ example: 'Développeur Web', description: 'Métier visé (parcours IA)' })
  @IsOptional()
  @IsString()
  objectifMetier?: string;

  @ApiPropertyOptional({ example: 'Débutant', description: 'Niveau évalué par l\'IA' })
  @IsOptional()
  @IsString()
  niveauEvalue?: string;

  @ApiPropertyOptional({ description: 'Date de l\'évaluation IA (ISO)' })
  @IsOptional()
  @IsString()
  assessmentDoneAt?: string;
}
