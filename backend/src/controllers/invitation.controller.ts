import { Request, Response, NextFunction } from 'express';
import { invitationService } from '../services/invitation.service';
import { notificationService } from '../services/notification.service';
import { prisma } from '../index';

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
      
      // Send real-time notification to invitee if they have an account
      const invitee = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (invitee) {
        const notification = await notificationService.notifyInvitation(
          invitation.board?.title || 'Board',
          invitation.inviter?.name || 'Someone',
          invitee.id,
          req.params.boardId
        );
        io.to(`user:${invitee.id}`).emit('notification:new', notification);
      }
      
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

  async getInvitationByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const invitation = await invitationService.getInvitationByToken(req.params.token);
      res.json({ success: true, data: invitation });
    } catch (error) {
      next(error);
    }
  }

  async acceptByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invitationService.acceptByToken(req.params.token, req.user!.userId);
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
}

export const invitationController = new InvitationController();
