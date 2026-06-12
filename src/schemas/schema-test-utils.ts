import type { ZodSafeParseError } from "zod";

export function expectParseSuccess<T>(result: {
  success: boolean;
  data?: T;
}): asserts result is { success: true; data: T } {
  expect(result.success).toBe(true);
}

export function expectFieldError(
  result: { success: boolean },
  field: string,
  message: string,
): void {
  expect(result.success).toBe(false);

  if (result.success) {
    return;
  }

  const error = result as ZodSafeParseError<unknown>;
  const fieldErrors = error.error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;

  expect(fieldErrors[field]).toContain(message);
}

export function expectRequiredFieldFailure(
  result: { success: boolean },
  field: string,
): void {
  expect(result.success).toBe(false);

  if (result.success) {
    return;
  }

  const error = result as ZodSafeParseError<unknown>;
  const fieldErrors = error.error.flatten().fieldErrors as Record<
    string,
    string[] | undefined
  >;

  expect(fieldErrors[field]?.length).toBeGreaterThan(0);
}

export function expectParseFailure(result: { success: boolean }): void {
  expect(result.success).toBe(false);
}
