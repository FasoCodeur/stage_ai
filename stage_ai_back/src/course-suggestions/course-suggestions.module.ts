import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSuggestionEntity } from '../database/entities/course-suggestion.entity';
import { UserEntity } from '../database/entities/user.entity';
import { CourseSuggestionsController } from './course-suggestions.controller';
import { CourseSuggestionsService } from './course-suggestions.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSuggestionEntity, UserEntity])],
  controllers: [CourseSuggestionsController],
  providers: [CourseSuggestionsService],
  exports: [CourseSuggestionsService],
})
export class CourseSuggestionsModule {}
