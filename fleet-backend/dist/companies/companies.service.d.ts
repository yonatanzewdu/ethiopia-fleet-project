import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesService {
    private companyRepository;
    constructor(companyRepository: Repository<Company>);
    create(createCompanyDto: CreateCompanyDto): Promise<Company>;
    findAll(): Promise<Company[]>;
}
