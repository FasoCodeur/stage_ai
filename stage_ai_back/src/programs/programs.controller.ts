import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramFilterDto } from './dto/program-filter.dto';

@ApiTags('Programmes')
@ApiBearerAuth()
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // ========== PROGRAM ENDPOINTS ==========

  @Get()
  @ApiOperation({ summary: 'Lister tous les programmes (avec filtres optionnels)' })
  @ApiQuery({ name: 'mentorId', required: false })
  @ApiQuery({ name: 'published', required: false })
  findAll(@Query() filter?: ProgramFilterDto) {
    return this.programsService.findAll(filter);
  }

  @Get('mentor/:mentorId')
  @ApiOperation({ summary: 'Programmes d\'un mentor' })
  findByMentor(@Param('mentorId') mentorId: string) {
    return this.programsService.findByMentorId(mentorId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Programmes d\'un étudiant' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.programsService.findByStudentId(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un programme' })
  @ApiResponse({ status: 200, description: 'Programme trouvé' })
  @ApiResponse({ status: 404, description: 'Programme non trouvé' })
  findOne(@Param('id') id: string) {
    return this.programsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un programme' })
  @ApiResponse({ status: 201, description: 'Programme créé' })
  create(@Body() dto: CreateProgramDto) {
    return this.programsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un programme' })
  update(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un programme' })
  remove(@Param('id') id: string) {
    this.programsService.remove(id);
    return { message: 'Programme supprimé avec succès' };
  }

  @Get(':id/expired')
  @ApiOperation({ summary: 'Vérifier si un programme est expiré' })
  isExpired(@Param('id') id: string) {
    return this.programsService.isProgramExpired(id);
  }

  // ========== LEVEL ENDPOINTS ==========

  @Get(':id/levels')
  @ApiOperation({ summary: 'Lister les niveaux d\'un programme' })
  getLevels(@Param('id') id: string) {
    return this.programsService.getLevels(id);
  }

  @Post(':id/levels')
  @ApiOperation({ summary: 'Créer un niveau dans un programme' })
  createLevel(
    @Param('id') id: string,
    @Body() data: { title: string; description?: string; duration: number; courses?: string[] },
  ) {
    return this.programsService.createLevel(id, data);
  }

  @Put('levels/:levelId')
  @ApiOperation({ summary: 'Mettre à jour un niveau' })
  updateLevel(
    @Param('levelId') levelId: string,
    @Body() data: { title?: string; description?: string; duration?: number; courses?: string[] },
  ) {
    return this.programsService.updateLevel(levelId, data);
  }

  @Delete('levels/:levelId')
  @ApiOperation({ summary: 'Supprimer un niveau' })
  removeLevel(@Param('levelId') levelId: string) {
    this.programsService.removeLevel(levelId);
    return { message: 'Niveau supprimé avec succès' };
  }

  // ========== ENROLLMENT & PROGRESSION ENDPOINTS ==========

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Inscrire un étudiant à un programme' })
  enroll(@Param('id') id: string, @Body('userId') userId: string) {
    return this.programsService.enrollStudent(id, userId);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Liste des inscriptions à un programme' })
  getEnrollments(@Param('id') id: string) {
    return this.programsService.getEnrollments(id);
  }

  @Post(':id/complete-course')
  @ApiOperation({ summary: 'Marquer un cours comme complété pour un étudiant' })
  completeCourse(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('courseId') courseId: string,
  ) {
    return this.programsService.completeCourse(id, userId, courseId);
  }

  @Put(':id/mentor-notes')
  @ApiOperation({ summary: 'Mettre à jour les notes du mentor pour un étudiant' })
  updateMentorNotes(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('mentorNotes') mentorNotes: string,
  ) {
    return this.programsService.updateMentorNotes(id, userId, mentorNotes);
  }

  @Get(':id/current-level/:userId')
  @ApiOperation({ summary: 'Obtenir le niveau actuel d\'un étudiant' })
  getCurrentLevel(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.programsService.getCurrentLevel(id, userId);
  }
}