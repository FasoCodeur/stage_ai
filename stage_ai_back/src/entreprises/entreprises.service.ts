import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { EntrepriseEntity } from '../database/entities/entreprise.entity';
import { TuteurEntrepriseEntity } from '../database/entities/tuteur-entreprise.entity';
import { UserEntity } from '../database/entities/user.entity';
import { OffreEntity } from '../database/entities/offre.entity';
import { StageEntity } from '../database/entities/stage.entity';
import { MailerService } from '../common/mailer/mailer.service';

const MAX_TUTEURS = 3;

/** Résultat de la création du compte d'accès d'une entreprise partenaire. */
export interface CompteAccesEntreprise {
  /** true si un nouveau compte a été créé */
  cree: boolean;
  email: string;
  /** Mot de passe provisoire — renvoyé uniquement à la création */
  motDePasse: string | null;
  /** true si un compte existait déjà avec cet email */
  dejaExistant: boolean;
  message: string;
}

@Injectable()
export class EntreprisesService {
  constructor(
    @InjectRepository(EntrepriseEntity)
    private readonly entrepriseRepo: Repository<EntrepriseEntity>,
    @InjectRepository(TuteurEntrepriseEntity)
    private readonly liaisonRepo: Repository<TuteurEntrepriseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OffreEntity)
    private readonly offreRepo: Repository<OffreEntity>,
    @InjectRepository(StageEntity)
    private readonly stageRepo: Repository<StageEntity>,
    private readonly mailerService: MailerService,
  ) {}

  findAll(): Promise<EntrepriseEntity[]> {
    return this.entrepriseRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<EntrepriseEntity> {
    const entreprise = await this.entrepriseRepo.findOneBy({ id });
    if (!entreprise) throw new NotFoundException('Entreprise non trouvée');
    return entreprise;
  }

  /**
   * Retrouve l'entreprise rattachée à un tuteur.
   * La table de liaison « tuteur_entreprise » est la source de référence ; on retombe
   * sur la colonne `users.entrepriseId` pour les comptes créés avant cette liaison.
   */
  async findByTuteur(tuteurId: string): Promise<EntrepriseEntity | null> {
    const liaison = await this.liaisonRepo.findOneBy({ tuteurId });
    if (liaison) {
      return this.entrepriseRepo.findOneBy({ id: liaison.entrepriseId });
    }

    const user = await this.userRepo.findOneBy({ id: tuteurId });
    if (user?.entrepriseId) {
      return this.entrepriseRepo.findOneBy({ id: user.entrepriseId });
    }

    return null;
  }

  /**
   * Crée une entreprise partenaire **et son compte d'accès** (rôle « tuteur »)
   * avec un mot de passe provisoire, afin qu'elle puisse se connecter
   * immédiatement à son espace.
   */
  async create(
    donnees: Partial<EntrepriseEntity>,
  ): Promise<{ entreprise: EntrepriseEntity; compte: CompteAccesEntreprise }> {
    const entreprise = await this.entrepriseRepo.save(this.entrepriseRepo.create(donnees));
    const compte = await this.creerCompteAcces(entreprise);
    return { entreprise, compte };
  }

  /** Génère un mot de passe provisoire lisible (ex : StageIA@482913). */
  private genererMotDePasse(): string {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `StageIA@${digits}`;
  }

  /** Initiales utilisées comme avatar du compte d'accès. */
  private initiales(nom: string): string {
    const parts = nom.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'EN';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  /** Crée la liaison tuteur ↔ entreprise si elle n'existe pas déjà. */
  private async rattacher(entrepriseId: string, tuteurId: string): Promise<void> {
    const existante = await this.liaisonRepo.findOneBy({ entrepriseId, tuteurId });
    if (existante) return;
    await this.liaisonRepo.save(this.liaisonRepo.create({ entrepriseId, tuteurId }));
  }

  /**
   * Ouvre le compte d'accès de l'entreprise (rôle « tuteur ») et le rattache,
   * ce qui donne accès à l'espace « Entreprise partenaire ».
   * Si l'email est déjà utilisé par un compte tuteur, on le rattache simplement.
   */
  private async creerCompteAcces(entreprise: EntrepriseEntity): Promise<CompteAccesEntreprise> {
    const email = entreprise.email;
    const existant = await this.userRepo.findOneBy({ email });

    if (existant && existant.role !== 'tuteur') {
      return {
        cree: false,
        email,
        motDePasse: null,
        dejaExistant: true,
        message: `Entreprise créée, mais aucun compte d'accès n'a pu être ouvert : l'email ${email} est déjà utilisé par un compte « ${existant.role} ». Modifiez l'email de l'entreprise ou rattachez un tuteur existant.`,
      };
    }

    if (existant) {
      await this.rattacher(entreprise.id, existant.id);
      return {
        cree: false,
        email,
        motDePasse: null,
        dejaExistant: true,
        message: `Un compte tuteur existait déjà avec l'email ${email} : il a été rattaché à l'entreprise.`,
      };
    }

    const motDePasse = this.genererMotDePasse();
    const compte = await this.userRepo.save(
      this.userRepo.create({
        name: entreprise.nom,
        email,
        password: await bcrypt.hash(motDePasse, 10),
        role: 'tuteur',
        avatar: this.initiales(entreprise.nom),
        phone: entreprise.contact || undefined,
        entrepriseId: entreprise.id,
      }),
    );
    await this.rattacher(entreprise.id, compte.id);

    // L'email ne doit jamais faire échouer la création de l'entreprise
    this.mailerService
      .sendWelcomeEntreprise(email, entreprise.nom, email, motDePasse)
      .catch(() => {});

    return {
      cree: true,
      email,
      motDePasse,
      dejaExistant: false,
      message: `Compte d'accès créé pour ${entreprise.nom}.`,
    };
  }

  async update(id: string, dto: Partial<EntrepriseEntity>): Promise<EntrepriseEntity> {
    const entreprise = await this.findById(id);
    Object.assign(entreprise, dto);
    return this.entrepriseRepo.save(entreprise);
  }

  async remove(id: string): Promise<void> {
    const entreprise = await this.findById(id);

    // On refuse la suppression si des données métier y sont rattachées :
    // supprimer en cascade effacerait des offres et des stages d'étudiants.
    const [offres, stages] = await Promise.all([
      this.offreRepo.countBy({ entrepriseId: id }),
      this.stageRepo.countBy({ entrepriseId: id }),
    ]);
    if (offres > 0 || stages > 0) {
      throw new BadRequestException(
        `Suppression impossible : ${offres} offre(s) et ${stages} stage(s) sont rattachés à cette entreprise. Suspendez-la plutôt.`,
      );
    }

    // Détache les tuteurs avant de supprimer, pour ne pas laisser de liaison orpheline
    await this.liaisonRepo.delete({ entrepriseId: id });
    await this.entrepriseRepo.remove(entreprise);
  }

  // ── Tuteurs ──
  async getTuteurs(entrepriseId: string) {
    await this.findById(entrepriseId);
    const liaisons = await this.liaisonRepo.find({ where: { entrepriseId } });
    return liaisons;
  }

  async getTuteursWithCount(entrepriseId: string) {
    const tuteurs = await this.getTuteurs(entrepriseId);
    return {
      entrepriseId,
      tuteurs,
      count: tuteurs.length,
      max: MAX_TUTEURS,
      limiteAtteinte: tuteurs.length >= MAX_TUTEURS,
    };
  }

  async addTuteur(entrepriseId: string, tuteurId: string) {
    await this.findById(entrepriseId);

    const tuteur = await this.userRepo.findOneBy({ id: tuteurId });
    if (!tuteur) throw new NotFoundException('Utilisateur tuteur non trouvé');
    if (tuteur.role !== 'tuteur') {
      throw new BadRequestException("L'utilisateur doit avoir le rôle 'tuteur'");
    }

    const existing = await this.liaisonRepo.findOneBy({ entrepriseId, tuteurId });
    if (existing) throw new BadRequestException('Ce tuteur est déjà rattaché à cette entreprise');

    const count = await this.liaisonRepo.countBy({ entrepriseId });
    if (count >= MAX_TUTEURS) {
      throw new BadRequestException(`Une entreprise ne peut avoir plus de ${MAX_TUTEURS} tuteurs`);
    }

    const liaison = this.liaisonRepo.create({ entrepriseId, tuteurId });
    return this.liaisonRepo.save(liaison);
  }

  async removeTuteur(entrepriseId: string, tuteurId: string): Promise<void> {
    const liaison = await this.liaisonRepo.findOneBy({ entrepriseId, tuteurId });
    if (!liaison) throw new NotFoundException('Liaison tuteur-entreprise non trouvée');
    await this.liaisonRepo.remove(liaison);
  }
}