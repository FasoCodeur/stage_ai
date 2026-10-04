import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { StageEntity } from '../database/entities/stage.entity';
import { MissionEntity } from '../database/entities/mission.entity';
import { TacheEntity } from '../database/entities/tache.entity';
import { TempsTravailEntity } from '../database/entities/temps-travail.entity';
import { LivrableEntity } from '../database/entities/livrable.entity';
import { ReunionEntity } from '../database/entities/reunion.entity';
import { MessageEntity } from '../database/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StageEntity,
      MissionEntity,
      TacheEntity,
      TempsTravailEntity,
      LivrableEntity,
      ReunionEntity,
      MessageEntity,
    ]),
  ],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService],
})
export class StagesModule {}