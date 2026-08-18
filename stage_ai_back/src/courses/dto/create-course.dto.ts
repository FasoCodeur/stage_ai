import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel } from '../../common/enums/course-level.enum';

class QuizQuestionDto {
  @ApiProperty({ example: 'q1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Quel élément HTML définit le titre de la page ?' })
  @IsString()
  question: string;

  @ApiProperty({ example: ['<title>', '<head>', '<h1>', '<meta>'] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: [0], description: 'Indices des bonnes réponses (une ou plusieurs)' })
  @IsArray()
  @IsNumber({}, { each: true })
  correctIndexes: number[];
}

class ContentBlockDto {
  @ApiProperty({ example: 'b1' })
  @IsString()
  id: string;

  @ApiProperty({ enum: ['texte', 'video', 'quiz', 'sandbox'], example: 'texte' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'html', description: 'Langage pour les blocs sandbox' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: '## Structure HTML\n...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/embed/...' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ type: [QuizQuestionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  quiz?: QuizQuestionDto[];

  @ApiPropertyOptional({ example: '// Code sandbox...' })
  @IsOptional()
  @IsString()
  sandboxCode?: string;
}

class LessonDto {
  @ApiProperty({ example: 'l1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Structure d\'une page HTML' })
  @IsString()
  title: string;

  @ApiProperty({ example: 15, description: 'Durée en minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ type: [ContentBlockDto], description: 'Blocs de contenu (texte, vidéo, quiz, sandbox)' })
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  blocks: ContentBlockDto[];
}

class ModuleDto {
  @ApiProperty({ example: 'm1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Fondamentaux HTML' })
  @IsString()
  title: string;

  @ApiProperty({ type: [LessonDto] })
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  lessons: LessonDto[];
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction au Développement Web' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Apprenez les bases du HTML, CSS et JavaScript...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Développement Web' })
  @IsString()
  category: string;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.DEBUTANT })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ example: 20, description: 'Durée en heures' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 35000, description: 'Prix en FCFA' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'u2' })
  @IsString()
  professorId: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ example: '🌐' })
  @IsString()
  thumbnail: string;

  @ApiProperty({ type: [ModuleDto] })
  @ValidateNested({ each: true })
  @Type(() => ModuleDto)
  modules: ModuleDto[];
}