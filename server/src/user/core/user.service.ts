import { db } from '@/data-source.js';
import { User, users } from '@/models/user.model.js';
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
};
