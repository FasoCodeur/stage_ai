import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StageRequestsController } from './stage-requests.controller';
import { StageRequestsService } from './stage-requests.service';
import { StageRequestEntity } from '../database/entities/stage-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StageRequestEntity])],
  controllers: [StageRequestsController],
  providers: [StageRequestsService],
  exports: [StageRequestsService],
})
export class StageRequestsModule {}