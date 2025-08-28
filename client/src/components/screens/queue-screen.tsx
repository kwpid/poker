import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/hooks/use-game';
import { useAuth } from '@/hooks/use-auth';

export function QueueScreen() {
  const { queueData, queueTime, leaveQueue, queueCount, queuePlayers } = useGame();
  const { user } = useAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedWait = queueData?.gameType === 'ranked' 
    ? Math.floor((user?.mmr || 800) / 100) + 8  // Higher MMR = longer wait
    : Math.floor(Math.random() * 10) + 5; // 5-15 seconds for casual

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md text-center animate-bounce-in">
        <CardContent className="p-8">
          <div className="mb-6">
            <i className="fas fa-search text-4xl text-primary mb-4 animate-spin-slow"></i>
            <h2 className="text-2xl font-bold mb-2">Finding Match</h2>
            <p className="text-muted-foreground">
              Searching for <span className="text-primary font-semibold capitalize" data-testid="queue-type">
                {queueData?.gameType}
              </span> game...
            </p>
          </div>

          {/* Queue Progress */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-accent mb-2" data-testid="queue-time">
              {formatTime(queueTime)}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((queueTime / estimatedWait) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Estimated wait: <span data-testid="estimated-wait">{estimatedWait-3}-{estimatedWait+5} seconds</span>
            </p>
          </div>

          {/* Queue Info */}
          <Card className="glass-card mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">In Queue</div>
                  <div className="font-semibold text-accent" data-testid="queue-count">
                    {queueCount}/6 players
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Your Rank</div>
                  <div className="font-semibold rank-badge" data-testid="queue-rank">
                    {user?.currentRank}
                  </div>
                </div>
              </div>
              
              {queueCount > 1 && queuePlayers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-muted animate-fade-in">
                  <div className="text-sm text-muted-foreground mb-2">Players Found:</div>
                  <div className="flex flex-wrap gap-2">
                    {queuePlayers.map((playerName, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-primary/20 rounded text-xs font-medium animate-slide-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {playerName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="destructive"
            className="w-full"
            onClick={leaveQueue}
            data-testid="button-cancel-queue"
          >
            <i className="fas fa-times mr-2"></i>Cancel Queue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
