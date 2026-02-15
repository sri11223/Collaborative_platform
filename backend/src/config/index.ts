import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  bcryptRounds: 12,
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
};
