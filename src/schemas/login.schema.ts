import { z } from "zod";

export type LoginSchemaMessages = {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
};

export function createLoginSchema(messages: LoginSchemaMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMin),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
