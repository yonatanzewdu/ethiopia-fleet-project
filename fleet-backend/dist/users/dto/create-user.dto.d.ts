export declare class CreateUserDto {
    username: string;
    password: string;
    role: 'admin' | 'manager' | 'driver';
    companyId?: number;
    driverId?: number;
}
