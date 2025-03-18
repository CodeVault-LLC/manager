import { db } from '@/data-source.js';
import { Session, sessions } from '@/models/schema';
import { eq } from 'drizzle-orm';

export const SessionService = {
  sanitizeSession(session: Session) {
    return {
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  },

  async createSession(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Session> {
    const createdSession = await db
      .insert(sessions)
      .values({
        deviceFingerprint: data.deviceFingerprint,
        ipAddress: data.ipAddress,
        sessionToken: data.sessionToken,
        userAgent: data.userAgent,
        userId: data.userId,
        isActive: true,
      })
      .returning()
      .execute();

    return createdSession[0] as Session;
  },

  async removeSession(sessionId: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId)).execute();
  },

  async retrieveSessionByToken(
    sessionToken: string,
  ): Promise<Session | undefined> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });

    return session;
  },
};
