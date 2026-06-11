export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AuthSessionUser = {
  id: string;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: AuthSessionUser;
};

export type LogoutResponse = {
  message: string;
};
