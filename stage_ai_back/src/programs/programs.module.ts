import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { ProgramEntity } from '../database/entities/program.entity';
import { ProgramEnrollmentEntity } from '../database/entities/program-enrollment.entity';
import { LevelEntity } from '../database/entities/level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramEntity, ProgramEnrollmentEntity, LevelEntity])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}