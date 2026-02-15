import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { setupSocket } from './socket';

export const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Make io accessible to routes
app.set('io', io);

// Routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Socket setup
setupSocket(io);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     TaskFlow API Server                  ║
  ║     Running on port ${PORT}                 ║
  ║     Environment: ${config.nodeEnv}          ║
  ╚══════════════════════════════════════════╝
  `);
});

export { io };
