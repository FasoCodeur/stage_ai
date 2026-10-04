import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/** Données d'un cours à créer (quand il n'existe pas sur la plateforme). */
export class SuggestedCourseDto {
  @ApiProperty({ example: 'Développement Web' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Intermédiaire' })
  @IsString()
  level: string;

  @ApiProperty({ example: 'Aucun cours React disponible pour cette étape.' })
  @IsString()
  justification: string;

  @ApiPropertyOptional({ example: ['React', 'Hooks'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competences?: string[];
}

export class CreateLearningPathStepDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ordre: number;

  @ApiProperty({ example: 'Maîtriser les bases du web' })
  @IsString()
  titre: string;

  @ApiProperty({ example: 'HTML, CSS puis JavaScript à travers un mini-projet.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Être capable de créer une page responsive' })
  @IsOptional()
  @IsString()
  objectif?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  semaineDebut?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  dureeHeures?: number;

  @ApiPropertyOptional({ description: 'ID du cours existant qui couvre cette étape' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: ['HTML', 'CSS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competences?: string[];

  @ApiPropertyOptional({ type: SuggestedCourseDto, description: 'Cours à suggérer à l\'admin si introuvable' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SuggestedCourseDto)
  suggestedCourse?: SuggestedCourseDto;
}

export class CreateLearningPathDto {
  @ApiProperty({ example: 'u3' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Développeur Web' })
  @IsString()
  objectifMetier: string;

  @ApiProperty({ example: 'Débutant' })
  @IsString()
  niveauEvalue: string;

  @ApiProperty({ example: 'Parcours Développeur Web — 12 semaines' })
  @IsString()
  titre: string;

  @ApiProperty({ example: 'Un parcours progressif du HTML au déploiement.' })
  @IsString()
  resume: string;

  @ApiPropertyOptional({ example: 'openai/gpt-oss-20b' })
  @IsOptional()
  @IsString()
  modeleIA?: string;

  @ApiProperty({ type: [CreateLearningPathStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLearningPathStepDto)
  steps: CreateLearningPathStepDto[];
}

export class UpdateLearningPathStepDto {
  @ApiPropertyOptional({ enum: ['a_faire', 'en_cours', 'termine'] })
  @IsOptional()
  @IsString()
  statut?: string;
}
