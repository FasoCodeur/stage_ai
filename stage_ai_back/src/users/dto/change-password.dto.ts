import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'StageIA@123456', description: 'Mot de passe actuel' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NouveauMotDePasse123', description: 'Nouveau mot de passe (min. 6 caractères)' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
