import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CourseEntity } from './entities/course.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PurchaseEntity } from './entities/purchase.entity';
import { StageRequestEntity } from './entities/stage-request.entity';
import { ProgramEntity } from './entities/program.entity';
import { ProgramEnrollmentEntity } from './entities/program-enrollment.entity';
import { LevelEntity } from './entities/level.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'stageia',
      entities: [
        UserEntity,
        CourseEntity,
        EnrollmentEntity,
        SubscriptionEntity,
        PurchaseEntity,
        StageRequestEntity,
        ProgramEntity,
        ProgramEnrollmentEntity,
        LevelEntity,
      ],
      synchronize: true, // only for dev
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      CourseEntity,
      EnrollmentEntity,
      SubscriptionEntity,
      PurchaseEntity,
      StageRequestEntity,
      ProgramEntity,
      ProgramEnrollmentEntity,
      LevelEntity,
    ]),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
