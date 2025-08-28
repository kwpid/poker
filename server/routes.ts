import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { gameService } from "./services/game-service";
import { eloService } from "./services/elo-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time game communication
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws, request) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, payload } = message;

        switch (type) {
          case 'join_queue':
            await gameService.joinQueue(ws, payload.gameType, payload.userId, payload.userData);
            break;
          
          case 'leave_queue':
            await gameService.leaveQueue(ws, payload.userId);
            break;
          
          case 'game_action':
            await gameService.handleGameAction(ws, payload.gameId, payload.userId, payload.action, payload.amount);
            break;
          
          case 'leave_game':
            await gameService.leaveGame(ws, payload.gameId, payload.userId);
            break;
          
          default:
            console.log('Unknown message type:', type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          payload: { message: 'Invalid message format' } 
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      gameService.handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // REST API routes
  app.get('/api/user/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/user', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User sync endpoint to sync Firebase users to server storage
  app.post('/api/user/sync', async (req, res) => {
    try {
      const { firebaseUid, username, email } = req.body;
      
      if (!firebaseUid || !username) {
        return res.status(400).json({ message: 'Firebase UID and username are required' });
      }
      
      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username,
          email,
          firebaseUid,
        });
        console.log('Synced new user to server storage:', user.username);
      }
      
      res.json(user);
    } catch (error) {
      console.error('User sync error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}
