import { WebSocket } from 'ws';
import { storage } from '../storage';
import { Game, QueueEntry } from '@shared/schema';
import { eloService } from './elo-service';

class GameService {
  private connectedClients: Map<WebSocket, string> = new Map(); // ws -> userId
  private userConnections: Map<string, WebSocket> = new Map(); // userId -> ws
  private gameConnections: Map<string, Set<WebSocket>> = new Map(); // gameId -> Set<ws>

  async joinQueue(ws: WebSocket, gameType: 'casual' | 'ranked', userId: string) {
    try {
      console.log(`Attempting to join queue: ${gameType} for user ${userId}`);
      
      const user = await storage.getUserByFirebaseUid(userId);
      console.log('Found user:', user ? user.username : 'NOT FOUND');
      
      if (!user) {
        console.log('User not found in storage');
        this.sendError(ws, 'User not found');
        return;
      }

      // Remove from any existing queue
      await this.leaveQueue(ws, userId);

      // Add to queue
      const queueEntry = await storage.addToQueue({
        userId: user.firebaseUid,
        username: user.username,
        gameType,
        mmr: user.mmr,
      });
      
      console.log('Created queue entry:', queueEntry);

      this.connectedClients.set(ws, userId);
      this.userConnections.set(userId, ws);

      console.log('Sending queue_joined message');
      this.sendMessage(ws, 'queue_joined', queueEntry);

      // Try to match players
      console.log('Attempting matchmaking...');
      await this.tryMatchmaking(gameType);
    } catch (error) {
      console.error('Join queue error:', error);
      this.sendError(ws, 'Failed to join queue');
    }
  }

  async leaveQueue(ws: WebSocket, userId: string) {
    try {
      await storage.removeFromQueue(userId);
      this.sendMessage(ws, 'queue_left', {});
    } catch (error) {
      console.error('Leave queue error:', error);
    }
  }

  async tryMatchmaking(gameType: 'casual' | 'ranked') {
    const queueEntries = await storage.getQueueEntries(gameType);
    
    if (queueEntries.length >= 2) {
      // For casual: match any 2-6 players
      // For ranked: match players with similar MMR
      let playersToMatch: QueueEntry[] = [];

      if (gameType === 'casual') {
        playersToMatch = queueEntries.slice(0, Math.min(6, queueEntries.length));
      } else {
        // Ranked matchmaking - group by MMR
        const sortedEntries = queueEntries.sort((a, b) => a.mmr - b.mmr);
        for (let i = 0; i < sortedEntries.length - 1; i++) {
          const currentGroup = [sortedEntries[i]];
          
          for (let j = i + 1; j < sortedEntries.length; j++) {
            if (Math.abs(sortedEntries[j].mmr - sortedEntries[i].mmr) <= 200) {
              currentGroup.push(sortedEntries[j]);
              if (currentGroup.length >= 6) break;
            }
          }
          
          if (currentGroup.length >= 2) {
            playersToMatch = currentGroup;
            break;
          }
        }
      }

      if (playersToMatch.length >= 2) {
        await this.createGame(playersToMatch, gameType);
      }
    }
  }

  async createGame(queueEntries: QueueEntry[], gameType: 'casual' | 'ranked') {
    try {
      // Remove players from queue
      for (const entry of queueEntries) {
        await storage.removeFromQueue(entry.userId);
      }

      // Create game
      const game = await storage.createGame({
        type: gameType,
        status: 'in_progress',
        players: queueEntries.map((entry, index) => ({
          userId: entry.userId,
          username: entry.username,
          chips: 500,
          cards: [],
          position: index,
          isActive: true,
          hasActed: false,
          currentBet: 0,
          isFolded: false,
        })),
        pot: 0,
        communityCards: [],
        currentTurn: 0,
        round: 'preflop',
      });

      // Notify all players
      const gameConnections = new Set<WebSocket>();
      for (const entry of queueEntries) {
        const ws = this.userConnections.get(entry.userId);
        if (ws) {
          gameConnections.add(ws);
          this.sendMessage(ws, 'game_found', game);
        }
      }

      this.gameConnections.set(game.id, gameConnections);

      // Start dealing cards
      await this.dealCards(game.id);

    } catch (error) {
      console.error('Create game error:', error);
    }
  }

  async dealCards(gameId: string) {
    const game = await storage.getGame(gameId);
    if (!game) return;

    // Simple card dealing - TODO: Implement proper poker card deck
    const cards = ['A♠', 'K♥', 'Q♦', 'J♣', '10♠', '9♥', '8♦', '7♣'];
    
    const updatedPlayers = game.players.map(player => ({
      ...player,
      cards: [cards[Math.floor(Math.random() * cards.length)], cards[Math.floor(Math.random() * cards.length)]]
    }));

    const updatedGame = await storage.updateGame(gameId, {
      players: updatedPlayers,
    });

    if (updatedGame) {
      this.broadcastToGame(gameId, 'game_updated', updatedGame);
    }
  }

  async handleGameAction(ws: WebSocket, gameId: string, userId: string, action: string, amount?: number) {
    try {
      const game = await storage.getGame(gameId);
      if (!game) {
        this.sendError(ws, 'Game not found');
        return;
      }

      const playerIndex = game.players.findIndex(p => p.userId === userId);
      if (playerIndex === -1) {
        this.sendError(ws, 'Player not in game');
        return;
      }

      if (game.currentTurn !== playerIndex) {
        this.sendError(ws, 'Not your turn');
        return;
      }

      const player = game.players[playerIndex];
      let updatedGame = { ...game };

      switch (action) {
        case 'fold':
          updatedGame.players[playerIndex] = {
            ...player,
            isFolded: true,
            hasActed: true,
          };
          break;

        case 'check':
          updatedGame.players[playerIndex] = {
            ...player,
            hasActed: true,
          };
          break;

        case 'bet':
          if (!amount || amount > player.chips) {
            this.sendError(ws, 'Invalid bet amount');
            return;
          }
          updatedGame.players[playerIndex] = {
            ...player,
            chips: player.chips - amount,
            currentBet: amount,
            hasActed: true,
          };
          updatedGame.pot += amount;
          break;

        default:
          this.sendError(ws, 'Invalid action');
          return;
      }

      // Move to next player
      updatedGame.currentTurn = this.getNextActivePlayer(updatedGame);

      // Check if round is complete
      if (this.isRoundComplete(updatedGame)) {
        updatedGame = await this.progressRound(updatedGame);
      }

      // Check for game end
      if (this.isGameComplete(updatedGame)) {
        await this.endGame(updatedGame);
        return;
      }

      const savedGame = await storage.updateGame(gameId, updatedGame);
      if (savedGame) {
        this.broadcastToGame(gameId, 'game_updated', savedGame);
      }

    } catch (error) {
      console.error('Game action error:', error);
      this.sendError(ws, 'Failed to process action');
    }
  }

  private getNextActivePlayer(game: Game): number {
    let nextPlayer = (game.currentTurn + 1) % game.players.length;
    
    while (game.players[nextPlayer].isFolded && nextPlayer !== game.currentTurn) {
      nextPlayer = (nextPlayer + 1) % game.players.length;
    }
    
    return nextPlayer;
  }

  private isRoundComplete(game: Game): boolean {
    const activePlayers = game.players.filter(p => !p.isFolded);
    return activePlayers.every(p => p.hasActed) || activePlayers.length <= 1;
  }

  private async progressRound(game: Game): Promise<Game> {
    const rounds = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const;
    const currentRoundIndex = rounds.indexOf(game.round);
    
    if (currentRoundIndex < rounds.length - 1) {
      // Reset player actions for next round
      const resetPlayers = game.players.map(p => ({ ...p, hasActed: false, currentBet: 0 }));
      
      return {
        ...game,
        round: rounds[currentRoundIndex + 1],
        players: resetPlayers,
        currentTurn: 0,
        // Add community cards based on round
        communityCards: this.addCommunityCards(game.communityCards, rounds[currentRoundIndex + 1])
      };
    }
    
    return game;
  }

  private addCommunityCards(existing: string[], round: string): string[] {
    const cards = ['A♠', 'K♥', 'Q♦', 'J♣', '10♠'];
    
    switch (round) {
      case 'flop':
        return existing.concat(cards.slice(0, 3));
      case 'turn':
        return existing.concat(cards.slice(3, 4));
      case 'river':
        return existing.concat(cards.slice(4, 5));
      default:
        return existing;
    }
  }

  private isGameComplete(game: Game): boolean {
    const activePlayers = game.players.filter(p => !p.isFolded);
    return activePlayers.length <= 1 || game.round === 'showdown';
  }

  private async endGame(game: Game) {
    const activePlayers = game.players.filter(p => !p.isFolded);
    const winner = activePlayers.length === 1 ? activePlayers[0] : this.determineWinner(activePlayers);
    
    // Calculate ELO changes for ranked games
    let eloChanges: Record<string, number> = {};
    if (game.type === 'ranked') {
      eloChanges = await eloService.calculateEloChanges(game.players);
      
      // Update user stats and ELO
      for (const player of game.players) {
        const user = await storage.getUserByFirebaseUid(player.userId);
        if (user) {
          const isWinner = player.userId === winner.userId;
          await storage.updateUser(user.id, {
            mmr: user.mmr + (eloChanges[player.userId] || 0),
            totalGames: user.totalGames + 1,
            totalWins: isWinner ? user.totalWins + 1 : user.totalWins,
            seasonWins: isWinner ? user.seasonWins + 1 : user.seasonWins,
          });
        }
      }
    }

    const completedGame = await storage.updateGame(game.id, {
      status: 'completed',
      winners: [winner.userId],
      eloChanges,
      completedAt: new Date(),
    });

    if (completedGame) {
      this.broadcastToGame(game.id, 'game_ended', completedGame);
    }

    // Clean up game connections
    this.gameConnections.delete(game.id);
  }

  private determineWinner(players: any[]): any {
    // Simple winner determination - TODO: Implement proper poker hand evaluation
    return players[Math.floor(Math.random() * players.length)];
  }

  async leaveGame(ws: WebSocket, gameId: string, userId: string) {
    try {
      const game = await storage.getGame(gameId);
      if (!game) return;

      // Mark player as folded
      const playerIndex = game.players.findIndex(p => p.userId === userId);
      if (playerIndex !== -1) {
        game.players[playerIndex].isFolded = true;
        await storage.updateGame(gameId, game);
        this.broadcastToGame(gameId, 'game_updated', game);
      }

      // Remove connection
      this.userConnections.delete(userId);
      this.connectedClients.delete(ws);
    } catch (error) {
      console.error('Leave game error:', error);
    }
  }

  handleDisconnect(ws: WebSocket) {
    const userId = this.connectedClients.get(ws);
    if (userId) {
      this.userConnections.delete(userId);
      this.connectedClients.delete(ws);
      
      // Remove from queue if in queue
      storage.removeFromQueue(userId);
    }
  }

  private sendMessage(ws: WebSocket, type: string, payload: any) {
    console.log(`Sending WebSocket message: ${type}`, payload);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      console.log('WebSocket not open, cannot send message');
    }
  }

  private sendError(ws: WebSocket, message: string) {
    this.sendMessage(ws, 'error', { message });
  }

  private broadcastToGame(gameId: string, type: string, payload: any) {
    const connections = this.gameConnections.get(gameId);
    if (connections) {
      const message = JSON.stringify({ type, payload });
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }
}

export const gameService = new GameService();
