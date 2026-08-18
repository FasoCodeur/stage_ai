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
import { ProgramsModule } from './programs/programs.module';
import { SandboxModule } from './sandbox/sandbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}