import { NextFunction, Request, Response, Router } from 'express';
import { UserService } from './user.service.js';
import multer, { memoryStorage, StorageEngine } from 'multer';
import { comparePassword, generateJWT, hashPassword } from '@/utils/jwt.js';
import { FileService } from '@/file/file.service.js';
import { SessionService } from '../session/session.service.js';
import { sessionRouter } from '../session/session.controller.js';

const storage: StorageEngine = memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10000000 } });
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const router = Router({ mergeParams: true });

router.use('/sessions', sessionRouter);

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(UserService.sanitizeUser(req.user));
  } catch (error) {
    next(error);
  }
});

router.post(
  '/register',
  upload.single('avatar'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        username,
        password,
        email,
        last_name,
        first_name,
      }: {
        email: string;
        password: string;
        username: string;
        last_name: string;
        first_name: string;
      } = req.body;
      const avatar = req.file;

      if (!email || !password || !username || !first_name || !last_name) {
        return res.status(400).json({
          error:
            'Missing required fields: email, password, username, first_name, last_name',
        });
      }

      if (!avatar) {
        return res.status(400).json({ error: 'Missing avatar' });
      }

      if (!ALLOWED_MIME_TYPES.includes(avatar.mimetype)) {
        return res.status(400).json({
          error: 'Avatar must be a valid image file (png, jpeg, or jpg)',
        });
      }

      const existingUser = await UserService.retrieveUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const avatarId = await FileService.uploadAvatar({
        file: avatar,
        acl: 'public-read',
      });

      // Create the user in the database with a hashed password
      const newUser = await UserService.createUser({
        avatar_id: avatarId,
        email,
        password: hashPassword(password),
        username,
        first_name,
        last_name,
        timezone,
      });

      const token = generateJWT(
        newUser.id,
        process.env.JWT_SECRET ?? '',
        process.env.JWT_EXPIRES_IN ?? '',
      );

      // Create a new session
      await SessionService.createSession({
        userId: newUser.id,
        systemInfo: req.headers['x-system'] as string,
        deviceFingerprint: '',
        ipAddress: req?.ip?.toString() ?? '',
        sessionToken: token,
        isActive: true,
        lastUsedAt: new Date(),
      });

      res.status(201).json({ token });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        return res.status(403).json({ error: 'User already logged in' });
      }

      const email = req.body.email;
      const password = req.body.password;

      const user = await UserService.retrieveUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = comparePassword(password, user?.password ?? '');

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = generateJWT(
        user.id,
        process.env.JWT_SECRET ?? '',
        process.env.JWT_EXPIRES_IN ?? '',
      );

      // Create a new session
      await SessionService.createSession({
        userId: user.id,
        systemInfo: req.headers['x-system'] as string,
        deviceFingerprint: '',
        ipAddress: req?.ip?.toString() ?? '',
        sessionToken: token,
        isActive: true,
        lastUsedAt: new Date(),
      });

      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/signout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = req.headers.authorization?.split(' ')[1];

      if (!sessionToken) {
        return res.status(400).json({ error: 'Missing session token' });
      }

      const session = await SessionService.retrieveSessionByToken(sessionToken);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await SessionService.removeSession(session.id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

export { router };
