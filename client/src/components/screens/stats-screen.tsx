import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface StatsScreenProps {
  onNavigate: (screen: 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats') => void;
}

export function StatsScreen({ onNavigate }: StatsScreenProps) {
  const { user } = useAuth();

  // Mock recent games data - TODO: Fetch from API
  const recentGames = [
    {
      id: '1',
      result: 'victory',
      type: 'ranked',
      players: 6,
      eloChange: 24,
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      result: 'defeat',
      type: 'ranked',
      players: 4,
      eloChange: -18,
      timeAgo: '5 hours ago'
    },
    {
      id: '3',
      result: 'victory',
      type: 'casual',
      players: 3,
      eloChange: 0,
      timeAgo: '1 day ago'
    }
  ];

  const winRate = user?.totalGames ? ((user.totalWins / user.totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('menu')}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-back"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </Button>
              <h1 className="text-2xl font-bold">Player Statistics</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Stat Cards */}
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <i className="fas fa-trophy text-3xl text-accent mb-3"></i>
                  <div className="text-2xl font-bold" data-testid="stat-total-wins">
                    {user?.totalWins || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Wins</div>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <i className="fas fa-gamepad text-3xl text-primary mb-3"></i>
                  <div className="text-2xl font-bold" data-testid="stat-games-played">
                    {user?.totalGames || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <i className="fas fa-percentage text-3xl text-green-500 mb-3"></i>
                  <div className="text-2xl font-bold" data-testid="stat-win-rate">
                    {winRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </CardContent>
              </Card>

              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <i className="fas fa-star text-3xl text-accent mb-3"></i>
                  <div className="text-2xl font-bold rank-badge" data-testid="stat-highest-rank">
                    {user?.highestRank || 'Bronze I'}
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Rank</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Games */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
                  <div className="space-y-3">
                    {recentGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`game-${game.id}`}
                      >
                        <div>
                          <div className={`font-semibold ${
                            game.result === 'victory' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {game.result === 'victory' ? 'Victory' : 'Defeat'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {game.type} • {game.players} players
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            game.eloChange > 0 ? 'text-green-500' : 
                            game.eloChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            {game.eloChange > 0 ? '+' : ''}{game.eloChange} {game.eloChange !== 0 ? 'ELO' : 'No ELO'}
                          </div>
                          <div className="text-xs text-muted-foreground">{game.timeAgo}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Season Progress */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Season Progress</h2>
                  <div className="space-y-6">
                    {/* Current Rank Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Current Rank</span>
                        <span className="rank-badge font-bold" data-testid="current-rank">
                          {user?.currentRank || 'Bronze I'}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-accent h-3 rounded-full" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{user?.mmr || 800} MMR</span>
                        <span>Next: {(user?.mmr || 800) + 100} MMR</span>
                      </div>
                    </div>

                    {/* Season Rewards */}
                    <div>
                      <h3 className="font-semibold mb-3">Season Rewards Progress</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Bronze Reward</span>
                          <span className="text-xs text-green-500 ml-auto">✓ Unlocked</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Silver Reward</span>
                          <span className="text-xs text-green-500 ml-auto">✓ Unlocked</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="text-sm">Gold Reward</span>
                          <span className="text-xs text-accent ml-auto">
                            {user?.seasonWins || 0}/10 wins
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-muted rounded-full"></div>
                          <span className="text-sm text-muted-foreground">Platinum Reward</span>
                          <span className="text-xs text-muted-foreground ml-auto">Locked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
