import { useState, useEffect, useCallback } from 'react';
import { gameSocket } from '@/lib/websocket';
import { Game, QueueEntry } from '@shared/schema';
import { useAuth } from './use-auth';

export function useGame() {
  const { user } = useAuth();
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueData, setQueueData] = useState<QueueEntry | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [queueTime, setQueueTime] = useState(0);
  const [navigationCallback, setNavigationCallback] = useState<((screen: 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats') => void) | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(0);
  const [gameNotifications, setGameNotifications] = useState<string[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [queuePlayers, setQueuePlayers] = useState<string[]>([]);

  useEffect(() => {
    gameSocket.connect();

    const handleQueueJoined = (data: QueueEntry) => {
      console.log('Queue joined:', data);
      setIsInQueue(true);
      setQueueData(data);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('queue');
      }
    };

    const handleQueueLeft = () => {
      console.log('Queue left');
      setIsInQueue(false);
      setQueueData(null);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('menu');
      }
    };

    const handleGameFound = (game: Game) => {
      console.log('Game found:', game);
      setIsInQueue(false);
      setQueueData(null);
      setCurrentGame(game);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('game');
      }
    };

    const handleGameUpdated = (game: Game) => {
      setCurrentGame(game);
    };

    const handleGameEnded = () => {
      setCurrentGame(null);
      setTurnTimeLeft(0);
      setGameNotifications([]);
    };

    const handlePlayerAction = (data: any) => {
      const { player, action, amount } = data;
      let message = '';
      
      switch (action) {
        case 'fold':
          message = `${player} folded`;
          break;
        case 'check':
          message = `${player} checked`;
          break;
        case 'bet':
          message = `${player} bet ${amount}`;
          break;
        case 'timeout_fold':
          message = `${player} timed out and folded`;
          break;
      }
      
      if (message) {
        setGameNotifications(prev => [...prev.slice(-4), message]); // Keep last 5 notifications
      }
    };

    const handleTurnTimerStart = (data: any) => {
      setTurnTimeLeft(data.timeLeft);
      
      // Countdown timer
      const timer = setInterval(() => {
        setTurnTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleQueueCountUpdate = (data: any) => {
      setQueueCount(data.count);
      setQueuePlayers(data.players || []);
    };

    gameSocket.on('queue_joined', handleQueueJoined);
    gameSocket.on('queue_left', handleQueueLeft);
    gameSocket.on('game_found', handleGameFound);
    gameSocket.on('game_updated', handleGameUpdated);
    gameSocket.on('game_ended', handleGameEnded);
    gameSocket.on('player_action', handlePlayerAction);
    gameSocket.on('turn_timer_start', handleTurnTimerStart);
    gameSocket.on('queue_count_update', handleQueueCountUpdate);

    return () => {
      gameSocket.off('queue_joined', handleQueueJoined);
      gameSocket.off('queue_left', handleQueueLeft);
      gameSocket.off('game_found', handleGameFound);
      gameSocket.off('game_updated', handleGameUpdated);
      gameSocket.off('game_ended', handleGameEnded);
      gameSocket.off('player_action', handlePlayerAction);
      gameSocket.off('turn_timer_start', handleTurnTimerStart);
      gameSocket.off('queue_count_update', handleQueueCountUpdate);
    };
  }, [navigationCallback]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInQueue) {
      console.log('Starting queue timer');
      interval = setInterval(() => {
        setQueueTime(prev => {
          console.log('Queue time increment:', prev + 1);
          return prev + 1;
        });
      }, 1000);
    } else {
      console.log('Stopping queue timer, isInQueue:', isInQueue);
    }

    return () => {
      if (interval) {
        console.log('Clearing queue timer interval');
        clearInterval(interval);
      }
    };
  }, [isInQueue]);

  const joinQueue = useCallback((gameType: 'casual' | 'ranked') => {
    if (!user) return;
    console.log('Joining queue:', gameType, user.firebaseUid);
    gameSocket.send('join_queue', { 
      gameType, 
      userId: user.firebaseUid,
      userData: {
        username: user.username,
        email: user.email,
        firebaseUid: user.firebaseUid
      }
    });
  }, [user]);

  const setNavigation = useCallback((callback: (screen: 'auth' | 'menu' | 'queue' | 'game' | 'settings' | 'stats') => void) => {
    setNavigationCallback(() => callback);
  }, []);

  const leaveQueue = useCallback(() => {
    if (!user) return;
    gameSocket.send('leave_queue', { userId: user.firebaseUid });
  }, [user]);

  const makeMove = useCallback((action: string, amount?: number) => {
    if (!currentGame || !user) return;
    
    gameSocket.send('game_action', {
      gameId: currentGame.id,
      userId: user.firebaseUid,
      action,
      amount
    });
  }, [currentGame, user]);

  const leaveGame = useCallback(() => {
    if (!currentGame || !user) return;
    
    gameSocket.send('leave_game', { gameId: currentGame.id, userId: user.firebaseUid });
  }, [currentGame, user]);

  return {
    isInQueue,
    queueData,
    currentGame,
    queueTime,
    turnTimeLeft,
    gameNotifications,
    queueCount,
    queuePlayers,
    joinQueue,
    leaveQueue,
    makeMove,
    leaveGame,
    setNavigation,
  };
}
