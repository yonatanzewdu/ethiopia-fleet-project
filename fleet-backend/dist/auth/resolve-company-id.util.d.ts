import { AuthenticatedUser } from './jwt-payload.interface';
export declare function resolveCompanyId(user: AuthenticatedUser, companyIdQuery?: string): number | undefined;
