import prisma from '../lib/prisma';

type Role = 'viewer' | 'editor' | 'admin';

const promoteUserRole = async (userId: string, role: Role): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return;
    }
    throw error;
  }
};

export default promoteUserRole;
