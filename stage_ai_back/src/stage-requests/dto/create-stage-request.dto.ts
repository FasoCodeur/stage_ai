import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StageStatus } from '../../common/enums/status.enum';

export class CreateStageRequestDto {
  @ApiProperty({ example: 'Orange Sénégal' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'OS' })
  @IsString()
  companyLogo: string;

  @ApiProperty({ example: 'Stage Développeur Web Front-End' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Rejoignez l\'équipe digitale...' })
  @IsString()
  description: string;

  @ApiProperty({ example: '3 mois' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Développement Web' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ example: 'u3' })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({ enum: StageStatus, example: StageStatus.EN_ATTENTE })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;
}