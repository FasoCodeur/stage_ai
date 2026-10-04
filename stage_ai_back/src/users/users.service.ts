import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserEntity } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailerService } from '../common/mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Génère un mot de passe par défaut lisible (ex : StageIA@482913).
   */
  private generateDefaultPassword(): string {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `StageIA@${digits}`;
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOneBy({ email });
  }

  async findByCredentials(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    return this.userRepo.findBy({ role });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.userRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    // Mot de passe fourni par l'admin, ou mot de passe par défaut généré
    const plainPassword = dto.password && dto.password.length >= 6
      ? dto.password
      : this.generateDefaultPassword();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    const saved = await this.userRepo.save(user);

    // Notifie le nouveau professeur par email avec ses identifiants
    if (saved.role === 'professeur') {
      await this.mailerService.sendWelcomeProfessor(saved.email, saved.name, saved.email, plainPassword);
    }

    // On ne renvoie jamais le mot de passe (même haché) au client
    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword as UserEntity;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    const patch: Partial<UserEntity> = { ...dto } as Partial<UserEntity>;

    // Si un nouveau mot de passe est fourni, on le hache
    if (dto.password) {
      patch.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, patch);
    return this.userRepo.save(user);
  }

  /**
   * Change le mot de passe d'un utilisateur après vérification de l'ancien.
   */
  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.findById(id);
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    return { message: 'Mot de passe modifié avec succès' };
  }

  /**
   * Génère un jeton de réinitialisation de mot de passe valable 1 heure.
   */
  async createPasswordResetToken(email: string): Promise<{ user: UserEntity; token: string } | null> {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) return null;

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 heure
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await this.userRepo.save(user);

    return { user, token };
  }

  /**
   * Réinitialise le mot de passe à partir d'un jeton valide et non expiré.
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ resetToken: token });
    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException('Lien de réinitialisation invalide');
    }

    if (new Date(user.resetTokenExpiry) < new Date()) {
      throw new BadRequestException('Lien de réinitialisation expiré. Veuillez refaire une demande.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepo.save(user);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }
}
