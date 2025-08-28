import { storage } from '../storage';
import { eloService } from './elo-service';

class SeasonService {
  async checkSeasonEnd() {
    const currentSeason = await storage.getCurrentSeason();
    if (!currentSeason) return;

    const now = new Date();
    if (now >= currentSeason.endDate) {
      await this.endSeason(currentSeason.id);
      await this.startNewSeason(currentSeason.number + 1);
    }
  }

  private async endSeason(seasonId: string) {
    // Mark current season as inactive
    await storage.updateSeason(seasonId, { isActive: false });
    
    // Apply soft reset to all users
    const users = await storage.getAllUsers(); // TODO: Add this method to storage
    
    for (const user of users) {
      const newMmr = eloService.applySoftReset(user.mmr);
      await storage.updateUser(user.id, {
        mmr: newMmr,
        currentRank: eloService.getRankFromMmr(newMmr),
        seasonWins: 0,
        placementMatches: 0,
      });
    }
  }

  private async startNewSeason(seasonNumber: number) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // One month duration

    await storage.createSeason({
      number: seasonNumber,
      startDate,
      endDate,
      isActive: true,
    });
  }

  async getSeasonTimeLeft() {
    const currentSeason = await storage.getCurrentSeason();
    if (!currentSeason) return null;

    const now = new Date();
    const timeLeft = currentSeason.endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }
}

export const seasonService = new SeasonService();

// Check for season end every hour
setInterval(() => {
  seasonService.checkSeasonEnd();
}, 60 * 60 * 1000);
