import { Controller, Get, Post, Body, Param, Put, Delete, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CourseSuggestionsService } from './course-suggestions.service';
import { CreateCourseSuggestionDto } from './dto/create-course-suggestion.dto';
import { ReviewCourseSuggestionDto } from './dto/review-course-suggestion.dto';

@ApiTags('Suggestions de cours')
@Controller('course-suggestions')
export class CourseSuggestionsController {
  constructor(private readonly service: CourseSuggestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les suggestions de cours (filtre ?statut=en_attente)' })
  @ApiQuery({ name: 'statut', required: false })
  findAll(@Query('statut') statut?: string) {
    return this.service.findAll(statut);
  }

  @Get('pending/count')
  @ApiOperation({ summary: 'Nombre de suggestions en attente' })
  async countPending() {
    return { count: await this.service.countPending() };
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une suggestion" })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une suggestion de cours (IA / étudiant)' })
  create(@Body() dto: CreateCourseSuggestionDto) {
    return this.service.create(dto);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accepter une suggestion (cours créé par admin)' })
  accept(
    @Param('id') id: string,
    @Body() dto: ReviewCourseSuggestionDto,
    @Headers('x-user-id') reviewedBy?: string,
  ) {
    return this.service.accept(id, dto, reviewedBy);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Refuser une suggestion' })
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewCourseSuggestionDto,
    @Headers('x-user-id') reviewedBy?: string,
  ) {
    return this.service.reject(id, dto, reviewedBy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une suggestion' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Suggestion supprimée avec succès' };
  }
}
