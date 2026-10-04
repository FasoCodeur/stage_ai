import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCandidatureDto {
  @IsUUID()
  @IsNotEmpty()
  offreId: string;

  @IsUUID()
  @IsNotEmpty()
  etudiantId: string;
}