import { z } from 'zod';

/**
 * Base pagination query schema.
 * Module-specific filters can extend this via z.intersection or z.object().merge().
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  search: z.string().optional().default(''),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  filter: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
