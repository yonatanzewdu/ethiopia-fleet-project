import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserWithPasswordByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });
  }

  async getAllUsers(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      select: {
        id: true,
        username: true,
        role: true,
        companyId: true,
        driverId: true,
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createUser(dto: CreateUserDto): Promise<Partial<User>> {
    const { username, password, role, companyId, driverId } = dto;

    const existing = await this.userRepository.findOne({
      where: { username: username.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Username is already taken.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = this.userRepository.create({
      username: username.toLowerCase(),
      password: passwordHash,
      role,
      companyId: companyId ?? null,
      driverId: driverId ?? null,
    });

    const saved = await this.userRepository.save(newUser);
    const { password: _omit, ...result } = saved;
    return result;
  }

  async resetPassword(id: number, newPassword: string): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found.`);
    }
    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.save(user);
    return { success: true };
  }

  async deleteUser(id: number): Promise<{ success: true }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found.`);
    }
    await this.userRepository.remove(user);
    return { success: true };
  }
}
