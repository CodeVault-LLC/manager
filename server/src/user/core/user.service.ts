import { db } from '@/data-source.js';
import { FileService } from '@/file/file.service';
import { GoogleAccount } from '@/models/schema';
import { User, users } from '@/models/user/user.model.js';
import { eq } from 'drizzle-orm';
import { GoogleService } from '../google/google.service';
import { IGoogleUserLite } from '@shared/types/google';

export const UserService = {
  sanitizeUser(user: User, google: GoogleAccount | null) {
    const sanitizedUser = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      timezone: user.timezone,
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
};
