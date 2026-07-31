import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProgramFilterDto {
  @ApiPropertyOptional()
  mentorId?: string;

  @ApiPropertyOptional()
  published?: string;
}