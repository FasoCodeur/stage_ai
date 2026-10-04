import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProgramLevelDto } from './create-program-level.dto';

export class CreateProgramDto {
  @ApiProperty({ description: 'Titre du programme' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description du programme' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: "URL du logo du programme (renvoyée par POST /uploads). Null si aucun logo.",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @ApiPropertyOptional({
    description: 'Niveaux du programme, créés dans cet ordre au moment de la création',
    type: [CreateProgramLevelDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramLevelDto)
  levels?: CreateProgramLevelDto[];

  @ApiProperty({ description: 'Durée en mois' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: "Prix d'abonnement mensuel en FCFA" })
  @IsNumber()
  @Min(0)
  subscriptionPrice: number;

  @ApiProperty({ description: 'ID du mentor (professeur)' })
  @IsString()
  mentorId: string;

  @ApiPropertyOptional({ description: 'Publié ou non', default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ description: 'Date de début (YYYY-MM-DD)' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'Date de fin (YYYY-MM-DD)' })
  @IsString()
  endDate: string;
}