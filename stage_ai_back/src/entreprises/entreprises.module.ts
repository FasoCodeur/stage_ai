import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntreprisesController } from './entreprises.controller';
import { EntreprisesService } from './entreprises.service';
import { EntrepriseEntity } from '../database/entities/entreprise.entity';
import { TuteurEntrepriseEntity } from '../database/entities/tuteur-entreprise.entity';
import { UserEntity } from '../database/entities/user.entity';
import { OffreEntity } from '../database/entities/offre.entity';
import { StageEntity } from '../database/entities/stage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntrepriseEntity,
      TuteurEntrepriseEntity,
      UserEntity,
      OffreEntity,
      StageEntity,
    ]),
  ],
  controllers: [EntreprisesController],
  providers: [EntreprisesService],
  exports: [EntreprisesService],
})
export class EntreprisesModule {}