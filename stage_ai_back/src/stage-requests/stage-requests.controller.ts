import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StageRequestsService } from './stage-requests.service';
import { CreateStageRequestDto } from './dto/create-stage-request.dto';
import { StageStatus } from '../common/enums/status.enum';

@ApiTags('Demandes de Stage')
@ApiBearerAuth()
@Controller('stage-requests')
export class StageRequestsController {
  constructor(private readonly stageRequestsService: StageRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les demandes de stage' })
  findAll() {
    return this.stageRequestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une demande de stage' })
  findOne(@Param('id') id: string) {
    return this.stageRequestsService.findById(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Demandes de stage d\'un étudiant' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.stageRequestsService.findByStudentId(studentId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Filtrer par statut' })
  findByStatus(@Param('status') status: string) {
    return this.stageRequestsService.findByStatus(status);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une demande de stage' })
  create(@Body() dto: CreateStageRequestDto) {
    return this.stageRequestsService.create(dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande' })
  updateStatus(@Param('id') id: string, @Body('status') status: StageStatus) {
    return this.stageRequestsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande de stage' })
  async remove(@Param('id') id: string) {
    await this.stageRequestsService.remove(id);
    return { message: 'Demande de stage supprimée' };
  }
}