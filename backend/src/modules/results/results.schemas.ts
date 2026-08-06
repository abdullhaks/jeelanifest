import { z } from 'zod';

export const winnerSchema = z.object({
  rank: z.enum(['1st', '2nd', '3rd']),
  participantType: z.enum(['Student', 'Group']),
  chestCode: z.string().optional(),
  participant: z.string().min(1),
  pointsAwarded: z.number().min(0).default(0)
});

export const saveResultDraftSchema = z.object({
  competition: z.string().min(1, 'Competition is required'),
  winners: z.array(winnerSchema).default([]),
});

export const finalAnnouncementSchema = z.object({
  firstPlaceGroup: z.string().min(1),
  secondPlaceGroup: z.string().min(1),
  thirdPlaceGroup: z.string().min(1),
});

export type SaveResultDraftDto = z.infer<typeof saveResultDraftSchema>;
export type FinalAnnouncementDto = z.infer<typeof finalAnnouncementSchema>;
