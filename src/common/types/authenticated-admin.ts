export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: string;
  avatarUrl?: string | null;
  lastLoginAt?: Date | null;
  permissions: string[];
}
