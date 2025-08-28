import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useGame } from "@/hooks/use-game";
import { AuthScreen } from "@/components/screens/auth-screen";
import { MainMenu } from "@/components/screens/main-menu";
import { QueueScreen } from "@/components/screens/queue-screen";
import { GameScreen } from "@/components/screens/game-screen";
import { SettingsScreen } from "@/components/screens/settings-screen";
import { StatsScreen } from "@/components/screens/stats-screen";

type Screen = 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const { user, loading } = useAuth();
  const { isInQueue, currentGame, setNavigation } = useGame();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCurrentScreen('auth');
    } else if (currentGame) {
      setCurrentScreen('game');
    } else if (isInQueue) {
      setCurrentScreen('queue');
    } else if (currentScreen === 'auth') {
      setCurrentScreen('menu');
    }
  }, [user, loading, isInQueue, currentGame, currentScreen]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Connect game navigation to screen navigation
  useEffect(() => {
    setNavigation(handleNavigate);
  }, [setNavigation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen />;
      case 'menu':
        return <MainMenu onNavigate={handleNavigate} />;
      case 'queue':
        return <QueueScreen />;
      case 'game':
        return <GameScreen />;
      case 'settings':
        return <SettingsScreen onNavigate={handleNavigate} />;
      case 'stats':
        return <StatsScreen onNavigate={handleNavigate} />;
      default:
        return <MainMenu onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {renderScreen()}
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
