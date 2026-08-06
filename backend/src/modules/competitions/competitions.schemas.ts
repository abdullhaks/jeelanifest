import { z } from 'zod';

export const createCompetitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['group', 'individual']),
  categories: z.array(z.enum(['subJunior', 'junior', 'senior', 'general'])).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  stage: z.enum(['stage1', 'stage2', 'offStage']).optional().nullable(),
  groupEntries: z.array(z.object({
    group: z.string().min(1),
    chestCodes: z.array(z.string())
  })).optional(),
});

export const updateCompetitionSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['group', 'individual']).optional(),
  category: z.enum(['subJunior', 'junior', 'senior', 'general']).nullable().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  stage: z.enum(['stage1', 'stage2', 'offStage']).nullable().optional(),
  status: z.enum(['upcoming', 'started', 'ended']).optional(),
  groupEntries: z.array(z.object({
    group: z.string().min(1),
    chestCodes: z.array(z.string())
  })).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['upcoming', 'started', 'ended']),
});

export type CreateCompetitionDto = z.infer<typeof createCompetitionSchema>;
export type UpdateCompetitionDto = z.infer<typeof updateCompetitionSchema>;
