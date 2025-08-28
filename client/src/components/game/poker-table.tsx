import { Game } from '@shared/schema';
import { PlayerCard } from './player-card';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface PokerTableProps {
  game: Game;
}

export function PokerTable({ game }: PokerTableProps) {
  const { user } = useAuth();
  return (
    <div className="poker-table rounded-2xl p-8 mb-4 relative overflow-hidden min-h-[500px]">
      {/* Table Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Card className="glass-card rounded-full">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent mb-2" data-testid="table-pot">
              {game.pot}
            </div>
            <div className="text-sm text-muted-foreground">Total Pot</div>
            
            {/* Community Cards */}
            <div className="flex gap-2 mt-4 justify-center">
              {game.communityCards.slice(0, 5).map((card, index) => (
                <div
                  key={index}
                  className="card-back w-12 h-16 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  data-testid={`community-card-${index}`}
                >
                  {card || '?'}
                </div>
              ))}
              {/* Empty slots for future cards */}
              {Array.from({ length: 5 - game.communityCards.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-12 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                >
                  ?
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players positioned around the table */}
      {game.players.map((player, index) => (
        <PlayerCard
          key={player.userId}
          player={player}
          position={index}
          isCurrentPlayer={player.userId === user?.firebaseUid}
          isCurrentTurn={game.currentTurn === index}
        />
      ))}
    </div>
  );
}
