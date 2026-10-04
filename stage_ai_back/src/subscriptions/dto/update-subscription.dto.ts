import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SubscriptionStatus } from '../../common/enums/status.enum';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    description: "Nombre de mois à ajouter à la date de fin (prolongation)",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  extendMonths?: number;

  @ApiPropertyOptional({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;
}