import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'u3' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'c1' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedLessons?: string[];
}