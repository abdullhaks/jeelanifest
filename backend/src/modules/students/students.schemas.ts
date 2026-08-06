import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  chestNo: z.string().optional(),
  class: z.string().min(1, 'Class is required'),
  group: z.string().min(1, 'Group is required'),
  category: z.enum(['subJunior', 'junior', 'senior']),
  profileImage: z.string().url().optional().nullable(),
  // points and programs are explicitly omitted at creation per spec rules
});

export const updateStudentSchema = z.object({
  name: z.string().min(2),
  chestNo: z.string().optional(),
  class: z.string().optional(),
  group: z.string().min(1).optional(),
  category: z.enum(['subJunior', 'junior', 'senior']).optional(),
  profileImage: z.string().url().optional().nullable(),
});

export const assignProgramsSchema = z.object({
  competitionIds: z.array(z.string()),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
