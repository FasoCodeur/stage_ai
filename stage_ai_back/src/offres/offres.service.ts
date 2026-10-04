import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OffreEntity } from '../database/entities/offre.entity';
import { CandidatureEntity } from '../database/entities/candidature.entity';
import { EntrepriseEntity } from '../database/entities/entreprise.entity';
import { CreateOffreDto } from './dto/create-offre.dto';

@Injectable()
export class OffresService {
  constructor(
    @InjectRepository(OffreEntity)
    private readonly offreRepo: Repository<OffreEntity>,
    @InjectRepository(CandidatureEntity)
    private readonly candidatureRepo: Repository<CandidatureEntity>,
    @InjectRepository(EntrepriseEntity)
    private readonly entrepriseRepo: Repository<EntrepriseEntity>,
  ) {}

  findAll(): Promise<OffreEntity[]> {
    return this.offreRepo.find({ order: { createdAt: 'DESC' } });
  }

  findByStatut(statut: string): Promise<OffreEntity[]> {
    return this.offreRepo.findBy({ statut });
  }

  async findById(id: string): Promise<OffreEntity> {
    const offre = await this.offreRepo.findOneBy({ id });
    if (!offre) throw new NotFoundException('Offre non trouvée');
    return offre;
  }

  async create(dto: CreateOffreDto): Promise<OffreEntity> {
    // Une entreprise suspendue ne peut plus publier de nouvelles offres
    const entreprise = await this.entrepriseRepo.findOneBy({ id: dto.entrepriseId });
    if (!entreprise) throw new NotFoundException('Entreprise non trouvée');
    if (!entreprise.actif) {
      throw new BadRequestException(
        'Cette entreprise est suspendue : impossible de publier une nouvelle offre. Contactez l’administrateur.',
      );
    }

    const offre = this.offreRepo.create({ ...dto, statut: 'en_attente' });
    return this.offreRepo.save(offre);
  }

  async update(id: string, dto: Partial<CreateOffreDto>): Promise<OffreEntity> {
    const offre = await this.findById(id);
    Object.assign(offre, dto);
    return this.offreRepo.save(offre);
  }

  async validate(id: string): Promise<OffreEntity> {
    const offre = await this.findById(id);
    offre.statut = 'validee';
    return this.offreRepo.save(offre);
  }

  async refuse(id: string): Promise<OffreEntity> {
    const offre = await this.findById(id);
    offre.statut = 'refusee';
    return this.offreRepo.save(offre);
  }

  async remove(id: string): Promise<void> {
    const offre = await this.findById(id);
    await this.offreRepo.remove(offre);
  }

  // Postuler à une offre = créer une candidature (un clic)
  async postuler(offreId: string, etudiantId: string): Promise<CandidatureEntity> {
    const offre = await this.findById(offreId);
    if (offre.statut !== 'validee') {
      throw new BadRequestException('Offre non valide pour une candidature');
    }
    const existing = await this.candidatureRepo.findOneBy({ offreId, etudiantId });
    if (existing) throw new BadRequestException('Candidature déjà existante');
    const cand = this.candidatureRepo.create({
      offreId,
      etudiantId,
      statut: 'en_attente',
    });
    return this.candidatureRepo.save(cand);
  }
}