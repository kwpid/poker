import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function AuthScreen() {
  const [formData, setFormData] = useState({
    username: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle, completeGoogleSignup, needsUsername, firebaseUser } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      if (!needsUsername) {
        toast({ title: "Welcome back!", description: "Successfully logged in with Google." });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || formData.username.length < 3 || formData.username.length > 20) {
      toast({
        title: "Invalid username",
        description: "Username must be 3-20 characters",
        variant: "destructive"
      });
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      toast({
        title: "Invalid username",
        description: "Username must contain only English letters and numbers, no spaces",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await completeGoogleSignup(formData.username);
      toast({ title: "Account setup complete!", description: "Welcome to PokerElo!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (needsUsername && firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="glass-card w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-primary">Poker</span><span className="text-accent">Elo</span>
              </h1>
              <p className="text-muted-foreground">Choose your username</p>
            </div>

            <form onSubmit={handleUsernameSetup} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Username*</Label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="3-20 characters, English only"
                  className="w-full"
                  data-testid="input-username"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be unique, 3-20 characters, English only, no spaces
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full neon-glow"
                disabled={loading}
                data-testid="button-complete-signup"
              >
                <i className="fas fa-check mr-2"></i>
                {loading ? 'Creating Account...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="glass-card w-full max-w-md slide-in">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-primary">Poker</span><span className="text-accent">Elo</span>
            </h1>
            <p className="text-muted-foreground">Competitive Online Poker</p>
            <p className="text-sm text-muted-foreground mt-2">Sign in with Google to get started</p>
          </div>

          <Button
            type="button"
            className="w-full neon-glow mb-4"
            onClick={handleGoogleLogin}
            disabled={loading}
            data-testid="button-google-login"
          >
            <i className="fab fa-google mr-2"></i>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>By signing in, you agree to play fair and follow the community guidelines.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}