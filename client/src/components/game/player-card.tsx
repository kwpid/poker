import { Card, CardContent } from '@/components/ui/card';

interface Player {
  userId: string;
  username: string;
  chips: number;
  cards: string[];
  position: number;
  isActive: boolean;
  hasActed: boolean;
  currentBet: number;
  isFolded: boolean;
}

interface PlayerCardProps {
  player: Player;
  position: number;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
}

export function PlayerCard({ player, position, isCurrentPlayer, isCurrentTurn }: PlayerCardProps) {
  const getPositionClass = (pos: number) => {
    const positions = [
      'bottom-4 left-1/2 transform -translate-x-1/2', // Position 0 (bottom)
      'top-8 left-8',                                   // Position 1 (top-left)
      'top-8 right-8',                                  // Position 2 (top-right)
      'right-8 top-1/2 transform -translate-y-1/2',    // Position 3 (right)
      'bottom-8 right-8',                               // Position 4 (bottom-right)
      'left-8 top-1/2 transform -translate-y-1/2',     // Position 5 (left)
    ];
    return positions[pos] || positions[0];
  };

  return (
    <div 
      className={`absolute ${getPositionClass(position)} ${isCurrentTurn ? 'ring-2 ring-primary' : ''}`}
      data-testid={`player-${player.userId}`}
    >
      <Card className={`glass-card text-center ${isCurrentPlayer ? 'min-w-32' : 'min-w-28'} ${player.isFolded ? 'opacity-50' : ''}`}>
        <CardContent className={`${isCurrentPlayer ? 'p-4' : 'p-3'}`}>
          <div className={`${isCurrentPlayer ? 'w-12 h-12' : 'w-10 h-10'} ${isCurrentPlayer ? 'bg-primary' : 'bg-secondary'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
            <i className={`fas fa-user ${isCurrentPlayer ? 'text-primary-foreground' : 'text-secondary-foreground'}`}></i>
          </div>
          
          <div className="text-sm font-semibold" data-testid={`player-username-${player.userId}`}>
            {isCurrentPlayer ? 'You' : player.username}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <i className="fas fa-coins text-accent"></i> 
            <span data-testid={`player-chips-${player.userId}`}> {player.chips}</span>
          </div>
          
          {player.currentBet > 0 && (
            <div className="text-xs text-primary font-semibold mt-1">
              Bet: {player.currentBet}
            </div>
          )}
          
          {/* Player Cards */}
          <div className="flex gap-1 mt-2 justify-center">
            {player.cards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className={`${isCurrentPlayer ? 'w-8 h-11' : 'w-6 h-8'} ${
                  isCurrentPlayer && card !== 'hidden' 
                    ? 'card-back text-white text-xs flex items-center justify-center rounded' 
                    : 'bg-muted rounded border border-border'
                }`}
                data-testid={`player-card-${player.userId}-${cardIndex}`}
              >
                {isCurrentPlayer && card !== 'hidden' ? card : ''}
              </div>
            ))}
          </div>
          
          {isCurrentTurn && !player.hasActed && (
            <div className="text-xs text-primary font-semibold mt-1 animate-pulse">
              Your Turn
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
