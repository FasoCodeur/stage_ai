import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@ApiTags('Formations')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les formations (avec filtres optionnels)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'level', required: false, enum: ['Débutant', 'Intermédiaire', 'Avancé'] })
  @ApiQuery({ name: 'professorId', required: false })
  @ApiQuery({ name: 'published', required: false })
  findAll(@Query() filter?: CourseFilterDto) {
    return this.coursesService.findAll(filter);
  }

  @Get('new')
  @ApiOperation({ summary: 'Lister les formations récentes (-14 jours)' })
  async findNew() {
    const courses = await this.coursesService.findAll({ published: 'true' } as any);
    return courses.filter(c => this.coursesService.isCourseNew(c));
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Formations d\'un étudiant' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.coursesService.findByStudentId(studentId);
  }

  @Get('professor/:professorId')
  @ApiOperation({ summary: 'Formations d\'un professeur' })
  findByProfessor(@Param('professorId') professorId: string) {
    return this.coursesService.findByProfessorId(professorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une formation' })
  @ApiResponse({ status: 200, description: 'Formation trouvée' })
  @ApiResponse({ status: 404, description: 'Formation non trouvée' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une formation' })
  @ApiResponse({ status: 201, description: 'Formation créée' })
  create(@Body() dto: CreateCourseDto, @Headers('x-user-role') role?: string) {
    // Seul l'administrateur définit le prix d'un cours
    if (role !== 'admin') {
      dto.price = 0;
    }
    return this.coursesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une formation' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Headers('x-user-role') role?: string,
  ) {
    // Seul l'administrateur peut modifier le prix
    if (role !== 'admin') {
      delete dto.price;
    }
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une formation' })
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
    return { message: 'Formation supprimée avec succès' };
  }
}