import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateOffreDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  missions: string;

  @IsString()
  @IsNotEmpty()
  domaine: string;

  @IsString()
  @IsNotEmpty()
  duree: string;

  @IsUUID()
  @IsNotEmpty()
  entrepriseId: string;

  @IsUUID()
  @IsOptional()
  mentorId?: string;

  @IsOptional()
  domainData?: any;
}