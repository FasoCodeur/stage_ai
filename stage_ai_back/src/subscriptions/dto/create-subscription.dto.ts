import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubscriptionStatus } from '../../common/enums/status.enum';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'u3' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['mensuel'], example: 'mensuel' })
  @IsString()
  plan: string;

  @ApiPropertyOptional({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}