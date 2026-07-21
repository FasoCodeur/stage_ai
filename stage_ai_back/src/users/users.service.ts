import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

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

  findByCredentials(email: string, password: string): Promise<UserEntity | null> {
    return this.userRepo.findOneBy({ email, password });
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    return this.userRepo.findBy({ role });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.userRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }
}