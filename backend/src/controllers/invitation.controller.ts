import { Request, Response, NextFunction } from 'express';
import { invitationService } from '../services/invitation.service';

export class InvitationController {
  async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const invitation = await invitationService.createInvitation(
        req.params.boardId,
        req.body,
        req.user!.userId
      );
      const io = req.app.get('io');
      io.emit('invitation:created', invitation);
      res.status(201).json({ success: true, data: invitation });
    } catch (error) {
      next(error);
    }
  }

  async getUserInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const invitations = await invitationService.getUserInvitations(req.user!.email);
      res.json({ success: true, data: invitations });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invitationService.acceptInvitation(req.params.id, req.user!.userId);
      const io = req.app.get('io');
      io.to(`board:${result.boardId}`).emit('member:joined', {
        boardId: result.boardId,
        userId: req.user!.userId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async declineInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invitationService.declineInvitation(req.params.id, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBoardInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const invitations = await invitationService.getBoardInvitations(
        req.params.boardId,
        req.user!.userId
      );
      res.json({ success: true, data: invitations });
    } catch (error) {
      next(error);
    }
  }
}

export const invitationController = new InvitationController();
