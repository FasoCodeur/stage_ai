import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Jeton reçu par email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NouveauMotDePasse123', description: 'Nouveau mot de passe (min. 6 caractères)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
