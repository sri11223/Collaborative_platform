import express, { Express } from 'express';
import { setupRoutes } from '../routes';
import { errorHandler } from '../middleware/errorHandler';

/**
 * Creates a configured Express app instance for testing.
 * Shares the same route and middleware setup as the real server,
 * without starting the HTTP listener or Socket.IO.
 */
export function createTestApp(): Express {
  const app = express();
  app.use(express.json());

  // Mock Socket.IO — controllers call req.app.get('io')
  const mockIo = {
    to: () => mockIo,
    emit: () => mockIo,
    in: () => mockIo,
  };
  app.set('io', mockIo);

  setupRoutes(app);
  app.use(errorHandler);

  return app;
}
