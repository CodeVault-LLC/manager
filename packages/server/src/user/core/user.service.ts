import { db } from '@/data-source.js';
import { FileService } from '@/file/file.service';
import { GoogleAccount, tokens } from '@/models/schema';
import { User, users } from '@/models/user/user.model.js';
import { and, eq } from 'drizzle-orm';
import { GoogleService } from '../google/google.service';
import { IGoogleUserLite } from '@shared/types/google';
import { randomInt } from 'node:crypto';

export const UserService = {
  sanitizeUser(user: User, google: GoogleAccount | null) {
    const sanitizedUser = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      timezone: user.timezone,
      verified_email: user.verifiedEmail,
      username: user.username,
      avatar_url: FileService.getFileUrl(user.avatarId ?? ''),

      google: null as IGoogleUserLite | null,
    };

    if (google) {
      sanitizedUser.google = GoogleService.sanitizeGoogleData(google);
    }

    return sanitizedUser;
  },

  async retrieveUser(userId: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        googleAccount: true,
      },
    });

    return user;
  },

  async retrieveUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  },

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    timezone: string;
    avatar_id: string;
  }): Promise<User> {
    const createdUser = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        timezone: data.timezone,
        avatarId: data.avatar_id,
        isActive: true,
        isLocked: false,
      })
      .returning()
      .execute();

    return createdUser[0] as User;
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const updatedUser = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning()
      .execute();

    return updatedUser[0] as User;
  },

  async createPasswordResetToken(userId: number) {
    const token = randomInt(100000, 999999).toString();
    const decimalToken = parseInt(token, 10);

    await db.insert(tokens).values({
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
      token: decimalToken.toString(),
      type: 'password_reset',
      userId,
    });

    return token;
  },

  async createEmailVerificationToken(userId: number) {
    const existingToken = await db.query.tokens.findFirst({
      where: and(
        eq(tokens.userId, userId),
        eq(tokens.type, 'email_verification'),
      ),
      with: {
        users: true,
      },
    });

    if (existingToken) {
      if (new Date() > existingToken.expiresAt) {
        await db
          .delete(tokens)
          .where(eq(tokens.id, existingToken.id))
          .execute();
      } else {
        return existingToken.token;
      }
    }

    const token = randomInt(100000, 999999).toString();
    const decimalToken = parseInt(token, 10);

    await db.insert(tokens).values({
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
      token: decimalToken.toString(),
      type: 'email_verification',
      userId,
    });

    return token;
  },

  async verifyEmailToken(token: string) {
    const tokenData = await db.query.tokens.findFirst({
      where: eq(tokens.token, token),
      with: {
        users: true,
      },
    });

    if (!tokenData) {
      return null;
    }

    const { userId, expiresAt } = tokenData;

    if (new Date() > expiresAt) {
      throw new Error('Token expired');
    }

    await db
      .update(users)
      .set({ verifiedEmail: true })
      .where(eq(users.id, userId))
      .execute();

    return tokenData;
  },

  async verifyPasswordResetToken(token: string) {
    const tokenData = await db.query.tokens.findFirst({
      where: eq(tokens.token, token),
      with: {
        users: true,
      },
    });

    if (!tokenData) {
      return null;
    }

    const { expiresAt } = tokenData;

    if (new Date() > expiresAt) {
      throw new Error('Token expired');
    }

    await db.delete(tokens).where(eq(tokens.id, tokenData.id)).execute();

    return tokenData;
  },
};
