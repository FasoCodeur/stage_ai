import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPathEntity } from '../database/entities/learning-path.entity';
import { LearningPathStepEntity } from '../database/entities/learning-path-step.entity';
import { EnrollmentEntity } from '../database/entities/enrollment.entity';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';
import { CourseSuggestionsModule } from '../course-suggestions/course-suggestions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningPathEntity, LearningPathStepEntity, EnrollmentEntity]),
    CourseSuggestionsModule,
  ],
  controllers: [LearningPathsController],
  providers: [LearningPathsService],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
