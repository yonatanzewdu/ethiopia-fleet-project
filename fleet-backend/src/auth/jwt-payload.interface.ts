export interface JwtPayload {
  sub: number;
  username: string;
  role: 'admin' | 'manager' | 'driver';
  companyId: number | null;
  driverId: number | null;
}

export interface AuthenticatedUser extends JwtPayload {
  id: number;
}