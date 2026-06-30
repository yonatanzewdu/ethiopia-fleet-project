import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Partial<import("./entities/user.entity").User>[]>;
    create(createUserDto: CreateUserDto): Promise<Partial<import("./entities/user.entity").User>>;
}
