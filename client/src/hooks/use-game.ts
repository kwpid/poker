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

  useEffect(() => {
    gameSocket.connect();

    gameSocket.on('queue_joined', (data: QueueEntry) => {
      console.log('Queue joined:', data);
      setIsInQueue(true);
      setQueueData(data);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('queue');
      }
    });

    gameSocket.on('queue_left', () => {
      console.log('Queue left');
      setIsInQueue(false);
      setQueueData(null);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('menu');
      }
    });

    gameSocket.on('game_found', (game: Game) => {
      console.log('Game found:', game);
      setIsInQueue(false);
      setQueueData(null);
      setCurrentGame(game);
      setQueueTime(0);
      if (navigationCallback) {
        navigationCallback('game');
      }
    });

    gameSocket.on('game_updated', (game: Game) => {
      setCurrentGame(game);
    });

    gameSocket.on('game_ended', () => {
      setCurrentGame(null);
    });

    return () => {
      gameSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInQueue]);

  const joinQueue = useCallback((gameType: 'casual' | 'ranked') => {
    if (!user) return;
    console.log('Joining queue:', gameType, user.firebaseUid);
    gameSocket.send('join_queue', { gameType, userId: user.firebaseUid });
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
    joinQueue,
    leaveQueue,
    makeMove,
    leaveGame,
    setNavigation,
  };
}
