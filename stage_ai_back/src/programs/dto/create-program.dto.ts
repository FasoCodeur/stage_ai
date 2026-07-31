import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({ description: 'Titre du programme' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description du programme' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Emoji / thumbnail' })
  @IsString()
  thumbnail: string;

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