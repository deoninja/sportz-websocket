import { z } from 'zod';

// Define the match status enum
const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished'
};

// Schema for list matches query parameters
const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional()
});

// Schema for match ID parameter
const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Schema for creating a match
const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional()
  })
  .refine(
    (data) => {
      // Validate that startTime and endTime are valid ISO date strings
      const startTimeValid = !isNaN(Date.parse(data.startTime));
      const endTimeValid = !isNaN(Date.parse(data.endTime));
      return startTimeValid && endTimeValid;
    },
    {
      message: 'startTime and endTime must be valid ISO date strings',
      path: ['startTime', 'endTime']
    }
  )
  .superRefine((data, ctx) => {
    // Check that endTime is chronologically after startTime
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime']
      });
    }
  });

// Schema for updating scores
const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative()
});

export {
  listMatchesQuerySchema,
  MATCH_STATUS,
  matchIdParamSchema,
  createMatchSchema,
  updateScoreSchema
};