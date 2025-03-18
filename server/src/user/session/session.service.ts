import { db } from '@/data-source.js';
import { Session, sessions } from '@/models/schema';
import { and, eq, notInArray } from 'drizzle-orm';

export const SessionService = {
  sanitizeSession(session: Session) {
    return {
      id: session.id,
      userId: session.userId,
      systemInfo: session.systemInfo,
      isActive: session.isActive,
      ipAddress: session.ipAddress,
      lastUsedAt: session.lastUsedAt,
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
        systemInfo: data.systemInfo,
        lastUsedAt: data.lastUsedAt,
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

  async removeAllSessions(
    userId: number,
    excludedIds: number[] = [],
  ): Promise<void> {
    await db
      .delete(sessions)
      .where(
        and(eq(sessions.userId, userId), notInArray(sessions.id, excludedIds)),
      );
  },

  async retrieveSessionByToken(
    sessionToken: string,
  ): Promise<Session | undefined> {
    console.log(sessionToken);

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });

    return session;
  },

  async getAllSessions(userId: number): Promise<Session[]> {
    const sessionsList = await db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
    });

    return sessionsList.map((session) => this.sanitizeSession(session));
  },

  async updateDateLastUsedAt(sessionId: number): Promise<void> {
    await db
      .update(sessions)
      .set({ lastUsedAt: new Date() })
      .where(eq(sessions.id, sessionId))
      .execute();
  },
};
