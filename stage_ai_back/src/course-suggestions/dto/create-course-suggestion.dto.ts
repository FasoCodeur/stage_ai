import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCourseSuggestionDto {
  @ApiProperty({ example: 'Développement Web avec React' })
  @IsString()
  @MaxLength(200)
  titre: string;

  @ApiProperty({ example: 'Cours manquant pour compléter le parcours Développeur Web.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Développement Web' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Intermédiaire' })
  @IsString()
  level: string;

  @ApiPropertyOptional({ example: ['React', 'Hooks', 'API REST'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competences?: string[];

  @ApiProperty({ example: "Aucun cours React n'existe sur la plateforme, or c'est indispensable." })
  @IsString()
  justification: string;

  @ApiPropertyOptional({ example: 'Développeur Web' })
  @IsOptional()
  @IsString()
  objectifMetier?: string;

  @ApiPropertyOptional({ description: "Parcours d'origine" })
  @IsOptional()
  @IsString()
  sourcePathId?: string;

  @ApiPropertyOptional({ description: "Étudiant à l'origine de la demande" })
  @IsOptional()
  @IsString()
  demandeurId?: string;
}
