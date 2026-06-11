import { z } from "zod";

import { USER_ROLES } from "@/lib/auth/roles";

export type CreateUserSchemaMessages = {
  nameRequired: string;
  nameMin: string;
  nameMax: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  roleRequired: string;
};

export function createCreateUserSchema(messages: CreateUserSchemaMessages) {
  return z.object({
    name: z
      .string()
      .min(1, messages.nameRequired)
      .min(2, messages.nameMin)
      .max(100, messages.nameMax),
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMin),
    role: z.enum(USER_ROLES, { message: messages.roleRequired }),
  });
}

export type CreateUserFormValues = z.infer<
  ReturnType<typeof createCreateUserSchema>
>;
