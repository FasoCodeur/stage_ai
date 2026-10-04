import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffresController } from './offres.controller';
import { OffresService } from './offres.service';
import { OffreEntity } from '../database/entities/offre.entity';
import { CandidatureEntity } from '../database/entities/candidature.entity';
import { EntrepriseEntity } from '../database/entities/entreprise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OffreEntity, CandidatureEntity, EntrepriseEntity])],
  controllers: [OffresController],
  providers: [OffresService],
  exports: [OffresService],
})
export class OffresModule {}