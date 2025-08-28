import { User, InsertUser, Game, QueueEntry, Season } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Game operations
  createGame(game: Omit<Game, 'id' | 'createdAt'>): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  getActiveGames(): Promise<Game[]>;
  
  // Queue operations
  addToQueue(entry: Omit<QueueEntry, 'id' | 'joinedAt'>): Promise<QueueEntry>;
  removeFromQueue(userId: string): Promise<void>;
  getQueueEntries(gameType: 'casual' | 'ranked'): Promise<QueueEntry[]>;
  
  // Season operations
  getCurrentSeason(): Promise<Season | undefined>;
  createSeason(season: Omit<Season, 'id'>): Promise<Season>;
  updateSeason(id: string, updates: Partial<Season>): Promise<Season | undefined>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private games: Map<string, Game> = new Map();
  private queueEntries: Map<string, QueueEntry> = new Map();
  private seasons: Map<string, Season> = new Map();

  constructor() {
    // Initialize with pre-season
    this.createSeason({
      number: 0,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-09-01'),
      isActive: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      currentRank: "Bronze I",
      mmr: 800,
      level: 1,
      totalWins: 0,
      totalGames: 0,
      seasonWins: 0,
      placementMatches: 0,
      highestRank: "Bronze I",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createGame(gameData: Omit<Game, 'id' | 'createdAt'>): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      ...gameData,
      id,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getActiveGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.status === 'in_progress'
    );
  }

  async addToQueue(entryData: Omit<QueueEntry, 'id' | 'joinedAt'>): Promise<QueueEntry> {
    const id = randomUUID();
    const entry: QueueEntry = {
      ...entryData,
      id,
      joinedAt: new Date(),
    };
    this.queueEntries.set(entry.userId, entry);
    return entry;
  }

  async removeFromQueue(userId: string): Promise<void> {
    this.queueEntries.delete(userId);
  }

  async getQueueEntries(gameType: 'casual' | 'ranked'): Promise<QueueEntry[]> {
    return Array.from(this.queueEntries.values()).filter(
      (entry) => entry.gameType === gameType
    );
  }

  async getCurrentSeason(): Promise<Season | undefined> {
    return Array.from(this.seasons.values()).find(
      (season) => season.isActive
    );
  }

  async createSeason(seasonData: Omit<Season, 'id'>): Promise<Season> {
    const id = randomUUID();
    const season: Season = {
      ...seasonData,
      id,
    };
    this.seasons.set(id, season);
    return season;
  }

  async updateSeason(id: string, updates: Partial<Season>): Promise<Season | undefined> {
    const season = this.seasons.get(id);
    if (!season) return undefined;
    
    const updatedSeason = { ...season, ...updates };
    this.seasons.set(id, updatedSeason);
    return updatedSeason;
  }

  async getLeaderboard(limit: number = 100): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.mmr - a.mmr)
      .slice(0, limit);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
