import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { StageEntity } from '../database/entities/stage.entity';
import { MessageEntity } from '../database/entities/message.entity';

@ApiTags('Stages')
@ApiBearerAuth()
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les stages' })
  findAll(
    @Query('etudiantId') etudiantId?: string,
    @Query('mentorId') mentorId?: string,
    @Query('entrepriseId') entrepriseId?: string,
  ): Promise<StageEntity[]> {
    if (etudiantId) return this.stagesService.findByEtudiant(etudiantId);
    if (mentorId) return this.stagesService.findByMentor(mentorId);
    if (entrepriseId) return this.stagesService.findByEntreprise(entrepriseId);
    return this.stagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un stage (dashboard complet)' })
  findOne(@Param('id') id: string) {
    return this.stagesService.getDashboard(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un stage (progression, statut)' })
  update(@Param('id') id: string, @Body() dto: Partial<StageEntity>): Promise<StageEntity> {
    return this.stagesService.update(id, dto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Messages du stage' })
  getMessages(@Param('id') id: string): Promise<MessageEntity[]> {
    return this.stagesService.getMessages(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Envoyer un message dans le stage' })
  envoyerMessage(
    @Param('id') id: string,
    @Body('expediteurId') expediteurId: string,
    @Body('contenu') contenu: string,
  ): Promise<MessageEntity> {
    return this.stagesService.envoyerMessage(id, expediteurId, contenu);
  }
}