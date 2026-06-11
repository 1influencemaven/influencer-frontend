import type { UserRole } from "@/types/auth";

export type User = {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type CreateUserResponse = User;
