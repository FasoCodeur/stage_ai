import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'prof@stageia.com', description: 'Email du compte' })
  @IsEmail()
  email: string;
}
