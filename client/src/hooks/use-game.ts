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

  useEffect(() => {
    gameSocket.connect();

    gameSocket.on('queue_joined', (data: QueueEntry) => {
      setIsInQueue(true);
      setQueueData(data);
      setQueueTime(0);
    });

    gameSocket.on('queue_left', () => {
      setIsInQueue(false);
      setQueueData(null);
      setQueueTime(0);
    });

    gameSocket.on('game_found', (game: Game) => {
      setIsInQueue(false);
      setQueueData(null);
      setCurrentGame(game);
      setQueueTime(0);
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
    gameSocket.send('join_queue', { gameType, userId: user.firebaseUid });
  }, [user]);

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
  };
}
