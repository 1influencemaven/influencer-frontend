import { z } from "zod";

import { USER_ROLES } from "@/lib/auth/roles";

export type UpdateUserSchemaMessages = {
  nameRequired: string;
  nameMin: string;
  nameMax: string;
  emailRequired: string;
  emailInvalid: string;
  passwordMin: string;
  roleRequired: string;
};

export function createUpdateUserSchema(messages: UpdateUserSchemaMessages) {
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
      .refine((value) => value === "" || value.length >= 8, messages.passwordMin),
    role: z.enum(USER_ROLES, { message: messages.roleRequired }),
  });
}

export type UpdateUserFormValues = z.infer<
  ReturnType<typeof createUpdateUserSchema>
>;
