import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface GameEndScreenProps {
  gameResult: {
    winner: string;
    winnerUserId: string;
    players: Array<{
      userId: string;
      username: string;
      finalChips: number;
      eloChange?: number;
    }>;
    gameType: 'casual' | 'ranked';
    roundsPlayed: number;
  };
  onBackToMenu: () => void;
}

export function GameEndScreen({ gameResult, onBackToMenu }: GameEndScreenProps) {
  const { user } = useAuth();
  const isWinner = gameResult.winnerUserId === user?.firebaseUid;
  const currentPlayer = gameResult.players.find(p => p.userId === user?.firebaseUid);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-2xl text-center animate-bounce-in">
        <CardContent className="p-8">
          {/* Winner Announcement */}
          <div className="mb-8">
            <div className={`text-6xl mb-4 ${isWinner ? 'animate-pulse-subtle' : ''}`}>
              {isWinner ? '🏆' : '💔'}
            </div>
            <h1 className={`text-4xl font-bold mb-2 ${isWinner ? 'text-accent' : 'text-muted-foreground'}`}>
              {isWinner ? 'Victory!' : 'Game Over'}
            </h1>
            <p className="text-xl text-muted-foreground">
              <span className="text-primary font-semibold">{gameResult.winner}</span> wins the game!
            </p>
          </div>

          {/* Game Stats */}
          <Card className="glass-card mb-6 animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Game Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Game Type</div>
                  <div className="font-semibold capitalize">{gameResult.gameType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rounds Played</div>
                  <div className="font-semibold">{gameResult.roundsPlayed}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Your Final Chips</div>
                  <div className="font-semibold">{currentPlayer?.finalChips || 0}</div>
                </div>
                {gameResult.gameType === 'ranked' && currentPlayer?.eloChange !== undefined && (
                  <div>
                    <div className="text-muted-foreground">ELO Change</div>
                    <div className={`font-semibold ${currentPlayer.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPlayer.eloChange >= 0 ? '+' : ''}{currentPlayer.eloChange}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player Results */}
          <Card className="glass-card mb-6 animate-slide-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Final Standings</h3>
              <div className="space-y-3">
                {gameResult.players
                  .sort((a, b) => b.finalChips - a.finalChips)
                  .map((player, index) => (
                    <div 
                      key={player.userId} 
                      className={`flex justify-between items-center p-3 rounded-lg animate-stagger ${
                        player.userId === user?.firebaseUid 
                          ? 'bg-primary/20 border border-primary/30' 
                          : 'bg-muted/20'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`player-result-${player.username}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-accent text-black' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{player.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.finalChips} chips
                          </div>
                        </div>
                      </div>
                      {gameResult.gameType === 'ranked' && player.eloChange !== undefined && (
                        <div className={`text-sm font-medium ${
                          player.eloChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {player.eloChange >= 0 ? '+' : ''}{player.eloChange} ELO
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onBackToMenu}
              className="px-8 py-3"
              data-testid="button-back-to-menu"
            >
              <i className="fas fa-home mr-2"></i>Back to Menu
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-8 py-3"
              data-testid="button-play-again"
            >
              <i className="fas fa-redo mr-2"></i>Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}