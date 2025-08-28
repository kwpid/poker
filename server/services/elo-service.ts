import { RANKS, RANK_MMR_THRESHOLDS } from '@shared/schema';

class EloService {
  // K-factor for ELO calculation
  private readonly K_FACTOR = 32;

  async calculateEloChanges(players: any[]): Promise<Record<string, number>> {
    const eloChanges: Record<string, number> = {};
    
    // Get actual user data and attach MMR to players
    const { storage } = await import('../storage');
    const playersWithMmr = await Promise.all(
      players.map(async (player) => {
        const user = await storage.getUserByFirebaseUid(player.userId);
        return { ...player, mmr: user?.mmr || 1000 };
      })
    );
    
    // Sort players by final position (non-folded players get better positions)
    const sortedPlayers = [...playersWithMmr].sort((a, b) => {
      if (a.isFolded && !b.isFolded) return 1;
      if (!a.isFolded && b.isFolded) return -1;
      return b.chips - a.chips; // Higher chips = better position
    });

    // Calculate ELO changes based on final positions
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];
      const playerMmr = this.getUserMmr(player); // TODO: Get from user data
      
      let totalEloChange = 0;
      
      // Compare against all other players
      for (let j = 0; j < sortedPlayers.length; j++) {
        if (i === j) continue;
        
        const opponent = sortedPlayers[j];
        const opponentMmr = this.getUserMmr(opponent);
        
        // Determine if this player won against the opponent
        const won = i < j; // Lower index = better position
        
        // Calculate expected score
        const expectedScore = this.calculateExpectedScore(playerMmr, opponentMmr);
        
        // Actual score (1 for win, 0 for loss)
        const actualScore = won ? 1 : 0;
        
        // ELO change for this matchup
        const eloChange = this.K_FACTOR * (actualScore - expectedScore);
        totalEloChange += eloChange;
      }
      
      // Normalize by number of opponents
      eloChanges[player.userId] = Math.round(totalEloChange / (sortedPlayers.length - 1));
    }

    return eloChanges;
  }

  private getUserMmr(player: any): number {
    // This will be populated with actual user MMR in calculateEloChanges
    return player.mmr || 1000;
  }

  private calculateExpectedScore(playerMmr: number, opponentMmr: number): number {
    return 1 / (1 + Math.pow(10, (opponentMmr - playerMmr) / 400));
  }

  getRankFromMmr(mmr: number): string {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const rank = RANKS[i];
      if (mmr >= RANK_MMR_THRESHOLDS[rank]) {
        return rank;
      }
    }
    return RANKS[0]; // Default to Bronze I
  }

  getMmrForRank(rank: string): number {
    return RANK_MMR_THRESHOLDS[rank as keyof typeof RANK_MMR_THRESHOLDS] || 0;
  }

  // Soft reset for season (similar to Rocket League)
  applySoftReset(currentMmr: number): number {
    // Compress MMR towards 1000 (Gold I)
    const compressionFactor = 0.7;
    const targetMmr = 1000;
    
    return Math.round(targetMmr + (currentMmr - targetMmr) * compressionFactor);
  }
}

export const eloService = new EloService();
