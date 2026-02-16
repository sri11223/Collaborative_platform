import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { prisma } from './lib/prisma';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';
import { setupSocket } from './socket';

export { prisma };

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

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TaskFlow API Documentation',
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

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
