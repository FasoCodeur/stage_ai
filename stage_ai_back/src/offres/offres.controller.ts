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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffresService } from './offres.service';
import { CreateOffreDto } from './dto/create-offre.dto';
import { OffreEntity } from '../database/entities/offre.entity';
import { CandidatureEntity } from '../database/entities/candidature.entity';

@ApiTags('Offres')
@ApiBearerAuth()
@Controller('offres')
export class OffresController {
  constructor(private readonly offresService: OffresService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les offres (filtre optionnel ?statut=validee)' })
  findAll(@Query('statut') statut?: string): Promise<OffreEntity[]> {
    return statut
      ? this.offresService.findByStatut(statut)
      : this.offresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une offre" })
  @ApiResponse({ status: 404, description: 'Offre non trouvée' })
  findOne(@Param('id') id: string): Promise<OffreEntity> {
    return this.offresService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Créer une offre (entreprise)" })
  @ApiResponse({ status: 201, description: 'Offre créée (statut en_attente)' })
  create(@Body() dto: CreateOffreDto): Promise<OffreEntity> {
    return this.offresService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: "Mettre à jour une offre" })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOffreDto>,
  ): Promise<OffreEntity> {
    return this.offresService.update(id, dto);
  }

  @Put(':id/validate')
  @ApiOperation({ summary: "Valider une offre (admin) -> statut validee" })
  validate(@Param('id') id: string): Promise<OffreEntity> {
    return this.offresService.validate(id);
  }

  @Put(':id/refuse')
  @ApiOperation({ summary: "Refuser une offre (admin) -> statut refusee" })
  refuse(@Param('id') id: string): Promise<OffreEntity> {
    return this.offresService.refuse(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Supprimer une offre" })
  async remove(@Param('id') id: string) {
    await this.offresService.remove(id);
    return { message: 'Offre supprimée' };
  }

  @Post(':id/postuler')
  @ApiOperation({ summary: 'Postuler en un clic (étudiant)' })
  @ApiResponse({ status: 201, description: 'Candidature créée' })
  postuler(
    @Param('id') id: string,
    @Body('etudiantId') etudiantId: string,
  ): Promise<CandidatureEntity> {
    return this.offresService.postuler(id, etudiantId);
  }
}