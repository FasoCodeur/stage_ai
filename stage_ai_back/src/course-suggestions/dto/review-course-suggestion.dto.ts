import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewCourseSuggestionDto {
  @ApiPropertyOptional({ description: "ID du cours créé à partir de la suggestion" })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Motif du refus' })
  @IsOptional()
  @IsString()
  motif?: string;
}
