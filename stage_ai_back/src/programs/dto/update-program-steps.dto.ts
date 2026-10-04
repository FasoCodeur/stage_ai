import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/** Étape envoyée lors du remplacement complet du parcours d'un programme. */
export class UpdateProgramStepDto {
  @ApiPropertyOptional({
    description: "ID de l'étape existante. Absent = nouvelle étape.",
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: "Titre de l'étape" })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: "Description de l'étape", default: '' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Durée de l'étape en jours" })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'IDs des cours rattachés', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courses?: string[];
}

export class UpdateProgramStepsDto {
  @ApiProperty({ description: "Parcours complet, dans l'ordre affiché", type: [UpdateProgramStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProgramStepDto)
  steps: UpdateProgramStepDto[];
}
