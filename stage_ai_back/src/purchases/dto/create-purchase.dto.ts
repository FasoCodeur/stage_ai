import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '../../common/enums/status.enum';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'u5' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'c1' })
  @IsString()
  courseId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.ORANGE_MONEY })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}