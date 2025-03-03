import { db } from '@/data-source.js';
import { User, users } from '@/models/user.model.js';
import { comparePassword, generateJWT } from '@/utils/jwt';
import { eq } from 'drizzle-orm';

export const UserService = {
  sanitizeUser(user: User) {
    const avatarUrl = `http://localhost:3000/users/${String(user.id)}/avatar`;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl,
    };
  },

  async retrieveUser(userId: number): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
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
        first_name: data.first_name,
        last_name: data.last_name,
        timezone: data.timezone,
        avatarId: data.avatar_id,
        is_active: true,
      })
      .returning()
      .execute();

    return createdUser[0] as User;
  },
};
