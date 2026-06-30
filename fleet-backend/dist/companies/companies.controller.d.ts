import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    create(createCompanyDto: CreateCompanyDto): Promise<import("./entities/company.entity").Company>;
    findAll(): Promise<import("./entities/company.entity").Company[]>;
}
