import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useGame } from '@/hooks/use-game';
import { useAuth } from '@/hooks/use-auth';
import { PokerTable } from '@/components/game/poker-table';

export function GameScreen() {
  const { user } = useAuth();
  const { currentGame, makeMove, leaveGame } = useGame();
  const [betAmount, setBetAmount] = useState([50]);

  if (!currentGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No active game</p>
      </div>
    );
  }

  const currentPlayer = currentGame.players.find(p => p.userId === user?.firebaseUid);
  const maxBet = currentPlayer?.chips || 0;

  const handleFold = () => {
    makeMove('fold');
  };

  const handleCheck = () => {
    makeMove('check');
  };

  const handleBet = () => {
    makeMove('bet', betAmount[0]);
  };

  const handleLeaveGame = () => {
    if (window.confirm('Are you sure you want to leave the game?')) {
      leaveGame();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <Card className="glass-card mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">
                  <span className="text-primary capitalize" data-testid="game-type">
                    {currentGame.type}
                  </span> Poker
                </h2>
                <div className="text-sm text-muted-foreground">
                  Game ID: <span className="font-mono" data-testid="game-id">{currentGame.id}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Pot</div>
                  <div className="text-xl font-bold text-accent" data-testid="pot-amount">
                    {currentGame.pot}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLeaveGame}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-leave-game"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poker Table */}
        <PokerTable game={currentGame} />

        {/* Player Actions */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Betting Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Bet:</label>
                  <Slider
                    value={betAmount}
                    onValueChange={setBetAmount}
                    max={maxBet}
                    min={0}
                    step={10}
                    className="w-24"
                    data-testid="bet-slider"
                  />
                  <Input
                    type="number"
                    value={betAmount[0]}
                    onChange={(e) => setBetAmount([parseInt(e.target.value) || 0])}
                    min={0}
                    max={maxBet}
                    className="w-20 text-center"
                    data-testid="bet-input"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleFold}
                  data-testid="button-fold"
                >
                  <i className="fas fa-times mr-2"></i>Fold
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCheck}
                  data-testid="button-check"
                >
                  <i className="fas fa-check mr-2"></i>Check
                </Button>
                <Button
                  className="neon-glow"
                  onClick={handleBet}
                  disabled={betAmount[0] <= 0}
                  data-testid="button-bet"
                >
                  <i className="fas fa-coins mr-2"></i>Bet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
