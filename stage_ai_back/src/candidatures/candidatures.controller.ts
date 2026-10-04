import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidaturesService } from './candidatures.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { CandidatureEntity } from '../database/entities/candidature.entity';

@ApiTags('Candidatures')
@ApiBearerAuth()
@Controller('candidatures')
export class CandidaturesController {
  constructor(private readonly candidaturesService: CandidaturesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les candidatures (filtre ?offreId=)' })
  findAll(@Query('offreId') offreId?: string): Promise<CandidatureEntity[]> {
    return offreId
      ? this.candidaturesService.findByOffre(offreId)
      : this.candidaturesService.findAll();
  }

  @Get('etudiant/:etudiantId')
  @ApiOperation({ summary: 'Candidatures d\'un étudiant' })
  findByEtudiant(@Param('etudiantId') etudiantId: string): Promise<CandidatureEntity[]> {
    return this.candidaturesService.findByEtudiant(etudiantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une candidature' })
  findOne(@Param('id') id: string): Promise<CandidatureEntity> {
    return this.candidaturesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une candidature' })
  create(@Body() dto: CreateCandidatureDto): Promise<CandidatureEntity> {
    return this.candidaturesService.create(dto);
  }

  @Put(':id/validate')
  @ApiOperation({ summary: 'Valider une candidature -> crée le stage + notifications' })
  validate(@Param('id') id: string, @Body('mentorId') mentorId?: string): Promise<CandidatureEntity> {
    return this.candidaturesService.updateStatut(id, 'validee', mentorId);
  }

  @Put(':id/refuse')
  @ApiOperation({ summary: 'Refuser une candidature' })
  refuse(@Param('id') id: string): Promise<CandidatureEntity> {
    return this.candidaturesService.updateStatut(id, 'refusee');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une candidature' })
  async remove(@Param('id') id: string) {
    await this.candidaturesService.remove(id);
    return { message: 'Candidature supprimée' };
  }
}