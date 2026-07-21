import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@ApiTags('Inscriptions')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les inscriptions' })
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Inscriptions d\'un utilisateur' })
  findByUser(@Param('userId') userId: string) {
    return this.enrollmentsService.findByUserId(userId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Inscriptions à une formation' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourseId(courseId);
  }

  @Get(':userId/:courseId')
  @ApiOperation({ summary: 'Vérifier une inscription spécifique' })
  findOne(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.enrollmentsService.findOne(userId, courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Inscrire un utilisateur à une formation' })
  @ApiResponse({ status: 201, description: 'Inscription créée' })
  @ApiResponse({ status: 409, description: 'Déjà inscrit' })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Put(':userId/:courseId/progress')
  @ApiOperation({ summary: 'Mettre à jour la progression' })
  updateProgress(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body('progress') progress: number,
    @Body('completedLessons') completedLessons: string[],
  ) {
    return this.enrollmentsService.updateProgress(userId, courseId, progress, completedLessons);
  }

  @Delete(':userId/:courseId')
  @ApiOperation({ summary: 'Désinscrire un utilisateur' })
  remove(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    this.enrollmentsService.remove(userId, courseId);
    return { message: 'Désinscription effectuée' };
  }
}