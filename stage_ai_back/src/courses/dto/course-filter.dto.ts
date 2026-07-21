import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseLevel } from '../../common/enums/course-level.enum';

export class CourseFilterDto {
  @ApiPropertyOptional({ example: 'Développement Web' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: 'u2' })
  @IsOptional()
  @IsString()
  professorId?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  published?: string;
}