// services/conversationsService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const conversationsService = {
  async create(data: any) {
    return await prisma.conversation.create({ data });
  },
  async get(id: number) {
    return await prisma.conversation.findUnique({ where: { id } });
  },
  async update(id: number, data: any) {
    return await prisma.conversation.update({ where: { id }, data });
  },
  async delete(id: number) {
    return await prisma.conversation.delete({ where: { id } });
  },
};
