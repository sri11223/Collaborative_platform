import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { config } from '../config';

export class AuthService {
  async signup(data: { email: string; name: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    // Auto-accept any pending invitations for this email
    const pendingInvitations = await prisma.invitation.findMany({
      where: { inviteeEmail: data.email, status: 'pending' },
    });
    for (const inv of pendingInvitations) {
      await prisma.boardMember.create({
        data: { boardId: inv.boardId, userId: user.id, role: inv.role },
      }).catch(() => {}); // ignore if already a member
      await prisma.invitation.update({
        where: { id: inv.id },
        data: { status: 'accepted' },
      });
    }

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, avatar: true, createdAt: true },
    });
    return user;
  }

  async searchUsers(query: string, excludeUserId: string) {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: excludeUserId } },
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: { id: true, email: true, name: true, avatar: true },
      take: 10,
    });
    return users;
  }
}

export const authService = new AuthService();
