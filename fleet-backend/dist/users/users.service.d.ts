import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    getUserWithPasswordByUsername(username: string): Promise<User | null>;
    getAllUsers(): Promise<Partial<User>[]>;
    createUser(dto: CreateUserDto): Promise<Partial<User>>;
}
