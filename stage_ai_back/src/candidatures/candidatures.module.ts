import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturesController } from './candidatures.controller';
import { CandidaturesService } from './candidatures.service';
import { CandidatureEntity } from '../database/entities/candidature.entity';
import { OffreEntity } from '../database/entities/offre.entity';
import { StageEntity } from '../database/entities/stage.entity';
import { NotificationEntity } from '../database/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CandidatureEntity,
      OffreEntity,
      StageEntity,
      NotificationEntity,
    ]),
  ],
  controllers: [CandidaturesController],
  providers: [CandidaturesService],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}