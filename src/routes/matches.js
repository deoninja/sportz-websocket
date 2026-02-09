import { Router } from "express";
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {matches} from "../db/schema.js";
import {db} from "../db/db.js";
import { desc } from "drizzle-orm";
import {getMatchStatus} from "../utils/match-status.js";

// const getMatchStatus = (startTime, endTime) => {
//   const now = new Date();
//   const start = new Date(startTime);
//   const end = new Date(endTime);
//
//   if (now < start) {
//     return MATCH_STATUS.SCHEDULED;
//   } else if (now >= start && now <= end) {
//     return MATCH_STATUS.LIVE;
//   } else {
//     return MATCH_STATUS.FINISHED;
//   }
// };

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if(!parsed.success) {
        return res.status(400).json({ error: "Invalid query.", details: JSON.stringify(parsed.error) });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy((desc(matches.createdAt)))
            .limit(limit)

        res.json({data})

    } catch (e){
        res.status(500).json({ error: "Failed to list Matches. sdfsdf"});
    }

})

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);
    const {data: { startTime, endTime, homeScore, awayScore }} = parsed;

    if(!parsed.success) {
        return res.status(400).json({ error: "Invalid payload.", details: JSON.stringify(parsed.error) });
    }

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime)
        }).returning();

        res.status(201).json({data: event});

    }catch(e) {
        return res.status(500).json({ error: 'Failed to create match.', details: JSON.stringify(e)});
    }

});