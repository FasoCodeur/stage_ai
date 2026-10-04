import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PurchaseEntity } from './entities/purchase.entity';
import { StageRequestEntity } from './entities/stage-request.entity';
import { ProgramEntity } from './entities/program.entity';
import { ProgramEnrollmentEntity } from './entities/program-enrollment.entity';
import { LevelEntity } from './entities/level.entity';
import { EntrepriseEntity } from './entities/entreprise.entity';
import { OffreEntity } from './entities/offre.entity';
import { CandidatureEntity } from './entities/candidature.entity';
import { StageEntity } from './entities/stage.entity';
import { MissionEntity } from './entities/mission.entity';
import { TacheEntity } from './entities/tache.entity';
import { LivrableEntity } from './entities/livrable.entity';
import { TempsTravailEntity } from './entities/temps-travail.entity';
import { ReunionEntity } from './entities/reunion.entity';
import { MessageEntity } from './entities/message.entity';
import { NotificationEntity } from './entities/notification.entity';
import { TuteurEntrepriseEntity } from './entities/tuteur-entreprise.entity';
import { LearningPathEntity } from './entities/learning-path.entity';
import { LearningPathStepEntity } from './entities/learning-path-step.entity';
import { CourseSuggestionEntity } from './entities/course-suggestion.entity';
import { SeedService } from './seed.service';

/**
 * Entités TypeORM de l'application.
 * Partagées entre la configuration de la connexion (forRootAsync) et les repositories (forFeature).
 */
const entities = [
  UserEntity,
  CourseEntity,
  EnrollmentEntity,
  SubscriptionEntity,
  PurchaseEntity,
  StageRequestEntity,
  ProgramEntity,
  ProgramEnrollmentEntity,
  LevelEntity,
  EntrepriseEntity,
  OffreEntity,
  CandidatureEntity,
  StageEntity,
  MissionEntity,
  TacheEntity,
  LivrableEntity,
  TempsTravailEntity,
  ReunionEntity,
  MessageEntity,
  NotificationEntity,
  TuteurEntrepriseEntity,
  LearningPathEntity,
  LearningPathStepEntity,
  CourseSuggestionEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const url = config.get<string>('DATABASE_URL');

        // Base distante (Neon…) : une seule URL, SSL obligatoire.
        // L'URL ne doit pas contenir sslmode/channel_binding : le SSL est forcé ici
        // (sslmode=require est déprécié dans pg-connection-string et écraserait l'option ssl).
        if (url) {
          return {
            type: 'postgres',
            url,
            ssl: { rejectUnauthorized: false },
            entities,
            synchronize: true, // only for dev
          };
        }

        // Base PostgreSQL locale (champs DB_* du .env), utilisée si DATABASE_URL est absente.
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'root'),
          database: config.get<string>('DB_DATABASE', 'stageia'),
          entities,
          synchronize: true, // only for dev
        };
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
