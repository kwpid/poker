import { z } from "zod";

// User schema
export const insertUserSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9]+$/, "English characters only, no spaces"),
  email: z.string().email().optional(),
  password: z.string().min(6),
  firebaseUid: z.string(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  currentRank: z.string().default("Bronze I"),
  mmr: z.number().default(800),
  level: z.number().default(1),
  totalWins: z.number().default(0),
  totalGames: z.number().default(0),
  seasonWins: z.number().default(0),
  placementMatches: z.number().default(0),
  highestRank: z.string().default("Bronze I"),
  createdAt: z.date().default(() => new Date()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Game schema
export const gameSchema = z.object({
  id: z.string(),
  type: z.enum(["casual", "ranked"]),
  status: z.enum(["waiting", "in_progress", "completed"]),
  players: z.array(z.object({
    userId: z.string(),
    username: z.string(),
    chips: z.number(),
    cards: z.array(z.string()),
    position: z.number(),
    isActive: z.boolean(),
    hasActed: z.boolean(),
    currentBet: z.number(),
    isFolded: z.boolean(),
  })),
  pot: z.number().default(0),
  communityCards: z.array(z.string()),
  currentTurn: z.number().default(0),
  round: z.enum(["preflop", "flop", "turn", "river", "showdown"]),
  winners: z.array(z.string()).optional(),
  eloChanges: z.record(z.number()).optional(),
  createdAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
});

export type Game = z.infer<typeof gameSchema>;

// Queue schema
export const queueEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  gameType: z.enum(["casual", "ranked"]),
  mmr: z.number(),
  joinedAt: z.date().default(() => new Date()),
});

export type QueueEntry = z.infer<typeof queueEntrySchema>;

// Season schema
export const seasonSchema = z.object({
  id: z.string(),
  number: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
});

export type Season = z.infer<typeof seasonSchema>;

// Rank definitions
export const RANKS = [
  "Bronze I", "Bronze II", "Bronze III",
  "Silver I", "Silver II", "Silver III",
  "Gold I", "Gold II", "Gold III",
  "Platinum I", "Platinum II", "Platinum III",
  "Diamond I", "Diamond II", "Diamond III",
  "Champion I", "Champion II", "Champion III",
  "Grand Champion"
] as const;

export const RANK_MMR_THRESHOLDS = {
  "Bronze I": 0,
  "Bronze II": 100,
  "Bronze III": 200,
  "Silver I": 300,
  "Silver II": 400,
  "Silver III": 500,
  "Gold I": 600,
  "Gold II": 700,
  "Gold III": 800,
  "Platinum I": 900,
  "Platinum II": 1000,
  "Platinum III": 1100,
  "Diamond I": 1200,
  "Diamond II": 1300,
  "Diamond III": 1400,
  "Champion I": 1500,
  "Champion II": 1600,
  "Champion III": 1700,
  "Grand Champion": 1800,
} as const;
