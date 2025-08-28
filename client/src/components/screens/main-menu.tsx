import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useGame } from '@/hooks/use-game';
import { SeasonCountdown } from '@/components/ui/season-countdown';

interface MainMenuProps {
  onNavigate: (screen: 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats') => void;
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const { user, logout } = useAuth();
  const { joinQueue } = useGame();

  const handleStartCasual = () => {
    joinQueue('casual');
  };

  const handleStartRanked = () => {
    joinQueue('ranked');
  };

  const handleOpenTutorial = () => {
    // TODO: Implement tutorial system
    alert('Tutorial coming soon!');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="glass-card rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-primary">Poker</span><span className="text-accent">Elo</span>
              </h1>
              <p className="text-muted-foreground">
                Welcome back, <span className="text-foreground font-medium">{user?.username}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Season Info */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Current Season</div>
                    <div className="text-xl font-bold text-accent">Pre-Season</div>
                    <div className="text-xs text-muted-foreground">Season 1 starts in:</div>
                    <SeasonCountdown />
                  </div>
                </CardContent>
              </Card>

              {/* User Rank */}
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Current Rank</div>
                    <div className="text-lg font-bold rank-badge" data-testid="user-rank">
                      {user?.currentRank}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="user-mmr">
                      {user?.mmr} MMR
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary-foreground"></i>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Game Modes */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Game Modes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="glass-card p-6 h-auto hover:bg-primary/10 transition-all group neon-glow"
                    onClick={handleStartCasual}
                    data-testid="button-casual"
                  >
                    <div className="text-center">
                      <i className="fas fa-play text-3xl text-primary mb-3 group-hover:scale-110 transition-transform"></i>
                      <h3 className="text-xl font-semibold mb-2">Casual</h3>
                      <p className="text-muted-foreground text-sm">Play for fun, no rank pressure</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="glass-card p-6 h-auto hover:bg-accent/10 transition-all group neon-glow"
                    onClick={handleStartRanked}
                    data-testid="button-ranked"
                  >
                    <div className="text-center">
                      <i className="fas fa-trophy text-3xl text-accent mb-3 group-hover:scale-110 transition-transform"></i>
                      <h3 className="text-xl font-semibold mb-2">Ranked</h3>
                      <p className="text-muted-foreground text-sm">Competitive matches, earn ELO</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tutorial & Learn */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Learn & Practice</h2>
                <Button
                  variant="outline"
                  className="w-full glass-card p-4 hover:bg-secondary/50 transition-all justify-start gap-4"
                  onClick={handleOpenTutorial}
                  data-testid="button-tutorial"
                >
                  <i className="fas fa-graduation-cap text-2xl text-primary"></i>
                  <div className="text-left">
                    <h3 className="font-semibold">Tutorial</h3>
                    <p className="text-sm text-muted-foreground">Learn how to play poker and understand ELO system</p>
                  </div>
                  <i className="fas fa-arrow-right ml-auto text-muted-foreground"></i>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-4">
            {/* Coming Soon Features */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Features</h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full glass-card p-3 opacity-50 cursor-not-allowed justify-start gap-3"
                    disabled
                    data-testid="button-inventory"
                  >
                    <i className="fas fa-box text-muted-foreground"></i>
                    <span className="text-sm">Inventory</span>
                    <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full glass-card p-3 opacity-50 cursor-not-allowed justify-start gap-3"
                    disabled
                    data-testid="button-leaderboards"
                  >
                    <i className="fas fa-crown text-muted-foreground"></i>
                    <span className="text-sm">Leaderboards</span>
                    <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Quick Access</h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full glass-card p-3 hover:bg-secondary/50 transition-all justify-start gap-3"
                    onClick={() => onNavigate('stats')}
                    data-testid="button-stats"
                  >
                    <i className="fas fa-chart-bar text-primary"></i>
                    <span className="text-sm">Stats</span>
                    <i className="fas fa-arrow-right ml-auto text-muted-foreground text-xs"></i>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full glass-card p-3 hover:bg-secondary/50 transition-all justify-start gap-3"
                    onClick={() => onNavigate('settings')}
                    data-testid="button-settings"
                  >
                    <i className="fas fa-cog text-muted-foreground"></i>
                    <span className="text-sm">Settings</span>
                    <i className="fas fa-arrow-right ml-auto text-muted-foreground text-xs"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Season Progress */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Season Progress</h2>
                <div className="space-y-4">
                  {/* Placement Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Placement Matches</span>
                      <span data-testid="placement-progress">{user?.placementMatches || 0}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${((user?.placementMatches || 0) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Season Rewards Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Season Wins</span>
                      <span data-testid="season-wins">{user?.seasonWins || 0}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${Math.min(((user?.seasonWins || 0) / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
