import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errors';

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of (result.error as ZodError).issues) {
      const path = issue.path.join('.');
      fields[path] = issue.message;
    }
    throw new ValidationError('Validation failed', fields);
  }
  return result.data;
}
