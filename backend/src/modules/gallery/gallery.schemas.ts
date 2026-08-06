import { z } from 'zod';

export const createGalleryImageSchema = z.object({
  description: z.string().optional(),
  image: z.string().url('A valid image URL is required'),
});

export const updateGalleryImageSchema = z.object({
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export type CreateGalleryImageDto = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageDto = z.infer<typeof updateGalleryImageSchema>;
