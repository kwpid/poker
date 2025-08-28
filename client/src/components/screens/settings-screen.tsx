import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';

interface SettingsScreenProps {
  onNavigate: (screen: 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats') => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    soundEffects: true,
    autoFold: false,
    showHandStrength: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
  });

  const handleSaveChanges = () => {
    // TODO: Implement settings save
    console.log('Saving settings:', settings);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Account</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2">Username</Label>
                      <Input
                        type="text"
                        value={user?.username || ''}
                        className="w-full"
                        disabled
                        data-testid="input-username"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-2">Email</Label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        className="w-full"
                        disabled
                        data-testid="input-email"
                      />
                    </div>
                    <Button
                      onClick={handleSaveChanges}
                      data-testid="button-save-account"
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Game Settings */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Game Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="soundEffects"
                        checked={settings.soundEffects}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, soundEffects: checked as boolean }))
                        }
                        data-testid="checkbox-sound-effects"
                      />
                      <Label htmlFor="soundEffects" className="text-sm font-medium">
                        Sound Effects
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoFold"
                        checked={settings.autoFold}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, autoFold: checked as boolean }))
                        }
                        data-testid="checkbox-auto-fold"
                      />
                      <Label htmlFor="autoFold" className="text-sm font-medium">
                        Auto-fold weak hands
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showHandStrength"
                        checked={settings.showHandStrength}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, showHandStrength: checked as boolean }))
                        }
                        data-testid="checkbox-hand-strength"
                      />
                      <Label htmlFor="showHandStrength" className="text-sm font-medium">
                        Show hand strength
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Privacy</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showOnlineStatus"
                        checked={settings.showOnlineStatus}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, showOnlineStatus: checked as boolean }))
                        }
                        data-testid="checkbox-online-status"
                      />
                      <Label htmlFor="showOnlineStatus" className="text-sm font-medium">
                        Show online status
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowFriendRequests"
                        checked={settings.allowFriendRequests}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, allowFriendRequests: checked as boolean }))
                        }
                        data-testid="checkbox-friend-requests"
                      />
                      <Label htmlFor="allowFriendRequests" className="text-sm font-medium">
                        Allow friend requests
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>PokerElo</strong> v1.0.0</p>
                    <p>Competitive online poker platform</p>
                    <p>© 2025 PokerElo. All rights reserved.</p>
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
