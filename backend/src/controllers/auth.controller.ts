import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password } = req.body;
      const result = await authService.signup({ email, name, password });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string || '';
      const users = await authService.searchUsers(query, req.user!.userId);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
