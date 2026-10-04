import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LearningPathsService } from './learning-paths.service';
import {
  CreateLearningPathDto,
  UpdateLearningPathStepDto,
} from './dto/create-learning-path.dto';

@ApiTags('Parcours personnalisés')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly service: LearningPathsService) {}

  @Post()
  @ApiOperation({ summary: "Enregistrer un parcours généré par l'IA" })
  create(@Body() dto: CreateLearningPathDto) {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Parcours d'un étudiant" })
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un parcours (avec ses étapes)" })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put('steps/:stepId')
  @ApiOperation({ summary: "Mettre à jour le statut d'une étape" })
  updateStep(@Param('stepId') stepId: string, @Body() dto: UpdateLearningPathStepDto) {
    return this.service.updateStep(stepId, dto);
  }

  @Post(':id/steps/:stepId/enroll')
  @ApiOperation({ summary: "S'inscrire au cours d'une étape du parcours" })
  enrollStep(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body('userId') userId: string,
  ) {
    return this.service.enrollStep(id, stepId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un parcours' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { message: 'Parcours supprimé avec succès' };
  }
}
