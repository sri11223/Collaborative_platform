import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class DocumentService {
  async getWorkspaceDocuments(workspaceId: string, userId: string) {
    // Verify user has access to workspace
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');
    const isMember = workspace.ownerId === userId ||
      await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      });
    if (!isMember) throw new ForbiddenError('Not a workspace member');

    return prisma.document.findMany({
      where: { workspaceId },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDocumentById(docId: string, userId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        workspace: true,
      },
    });
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }

  async createDocument(data: { title: string; content?: string; workspaceId: string }, userId: string) {
    return prisma.document.create({
      data: {
        title: data.title,
        content: data.content || '',
        workspaceId: data.workspaceId,
        createdBy: userId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async updateDocument(docId: string, data: { title?: string; content?: string }, userId: string) {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundError('Document not found');

    return prisma.document.update({
      where: { id: docId },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async deleteDocument(docId: string, userId: string) {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundError('Document not found');
    if (doc.createdBy !== userId) throw new ForbiddenError('Only creator can delete');

    await prisma.document.delete({ where: { id: docId } });
    return { message: 'Document deleted' };
  }
}

export const documentService = new DocumentService();
