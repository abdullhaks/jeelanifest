import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logoUrl: z.string().url().optional().nullable(),
  members: z.array(z.string()).default([]),
  leaders: z.array(z.string()).max(3, 'Cannot have more than 3 leaders').default([]),
  // totalPoints and isDeleted are intentionally omitted to prevent manual tampering during creation
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
  members: z.array(z.string()).optional(),
  leaders: z.array(z.string()).max(3).optional(),
});

export type CreateGroupDto = z.infer<typeof createGroupSchema>;
export type UpdateGroupDto = z.infer<typeof updateGroupSchema>;
