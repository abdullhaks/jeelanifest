import { z } from 'zod';

export const createPosterSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  competition: z.string().optional().nullable(),
  image: z.string().url('A valid image URL is required'),
});

export const updatePosterSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  competition: z.string().optional().nullable(),
  image: z.string().url().optional(),
});

export type CreatePosterDto = z.infer<typeof createPosterSchema>;
export type UpdatePosterDto = z.infer<typeof updatePosterSchema>;
