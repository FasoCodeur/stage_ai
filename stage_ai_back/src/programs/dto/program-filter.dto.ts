import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProgramFilterDto {
  @ApiPropertyOptional({ example: 'u2' })
  @IsOptional()
  @IsString()
  mentorId?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  published?: string;
}
