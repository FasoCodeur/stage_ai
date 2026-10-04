import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PurchasesModule } from './purchases/purchases.module';
import { StageRequestsModule } from './stage-requests/stage-requests.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './common/mailer/mailer.module';
import { ProgramsModule } from './programs/programs.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { OffresModule } from './offres/offres.module';
import { CandidaturesModule } from './candidatures/candidatures.module';
import { StagesModule } from './stages/stages.module';
import { EntreprisesModule } from './entreprises/entreprises.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { CourseSuggestionsModule } from './course-suggestions/course-suggestions.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule,
    DatabaseModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    SubscriptionsModule,
    PurchasesModule,
    StageRequestsModule,
    AuthModule,
    ProgramsModule,
    SandboxModule,
    OffresModule,
    CandidaturesModule,
    StagesModule,
    EntreprisesModule,
    LearningPathsModule,
    CourseSuggestionsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}