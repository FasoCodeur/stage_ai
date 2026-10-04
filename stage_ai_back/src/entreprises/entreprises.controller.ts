import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EntreprisesService } from './entreprises.service';
import { EntrepriseEntity } from '../database/entities/entreprise.entity';

@ApiTags('Entreprises')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('entreprises')
export class EntreprisesController {
  constructor(private readonly entreprisesService: EntreprisesService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lister les entreprises (admin)' })
  findAll(): Promise<EntrepriseEntity[]> {
    return this.entreprisesService.findAll();
  }

  @Get('by-tuteur/:tuteurId')
  @Roles('admin', 'tuteur')
  @ApiOperation({ summary: "Entreprise rattachée à un tuteur (null si aucun rattachement)" })
  getEntrepriseOfTuteur(@Param('tuteurId') tuteurId: string): Promise<EntrepriseEntity | null> {
    return this.entreprisesService.findByTuteur(tuteurId);
  }

  @Get(':id')
  @Roles('admin', 'tuteur')
  @ApiOperation({ summary: 'Détail d\'une entreprise' })
  findOne(@Param('id') id: string): Promise<EntrepriseEntity> {
    return this.entreprisesService.findById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: "Créer une entreprise + son compte d'accès (admin)",
    description:
      "Crée l'entreprise partenaire et ouvre son compte d'accès (rôle tuteur) avec un mot de passe provisoire, communiqué à l'administrateur et envoyé par email.",
  })
  create(@Body() dto: Partial<EntrepriseEntity>) {
    return this.entreprisesService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier une entreprise (admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<EntrepriseEntity>): Promise<EntrepriseEntity> {
    return this.entreprisesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une entreprise (admin)' })
  async remove(@Param('id') id: string) {
    await this.entreprisesService.remove(id);
    return { message: 'Entreprise supprimée' };
  }

  // ── Tuteurs ──
  @Get(':id/tuteurs')
  @Roles('admin', 'tuteur')
  @ApiOperation({ summary: 'Tuteurs d\'une entreprise (avec compteur)' })
  getTuteurs(@Param('id') id: string) {
    return this.entreprisesService.getTuteursWithCount(id);
  }

  @Post(':id/tuteurs')
  @Roles('admin', 'tuteur')
  @ApiOperation({ summary: 'Ajouter un tuteur (max 3)' })
  addTuteur(@Param('id') id: string, @Body('tuteurId') tuteurId: string) {
    return this.entreprisesService.addTuteur(id, tuteurId);
  }

  @Delete(':id/tuteurs/:tuteurId')
  @Roles('admin', 'tuteur')
  @ApiOperation({ summary: 'Retirer un tuteur' })
  removeTuteur(@Param('id') id: string, @Param('tuteurId') tuteurId: string) {
    this.entreprisesService.removeTuteur(id, tuteurId);
    return { message: 'Tuteur retiré de l\'entreprise' };
  }
}