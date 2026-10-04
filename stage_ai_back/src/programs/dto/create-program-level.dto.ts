import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/** Niveau créé en même temps que le programme. */
export class CreateProgramLevelDto {
  @ApiProperty({ description: 'Titre du niveau' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description du niveau', default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Durée du niveau en jours' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'IDs des cours rattachés au niveau', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];
}
