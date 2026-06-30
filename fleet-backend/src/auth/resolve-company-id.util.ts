import { AuthenticatedUser } from './jwt-payload.interface';

export function resolveCompanyId(
  user: AuthenticatedUser,
  companyIdQuery?: string,
): number | undefined {
  if (user.role === 'admin') {
    return companyIdQuery ? Number(companyIdQuery) : undefined;
  }
  return user.companyId ?? undefined;
}