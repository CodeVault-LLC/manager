import { NextFunction, Request, Response, Router } from 'express';
import { UserService } from './user.service.js';
import multer, { memoryStorage, StorageEngine } from 'multer';
import { comparePassword, generateJWT, hashPassword } from '@/utils/jwt.js';
import { FileService } from '@/file/file.service.js';
import { SessionService } from '../session/session.service.js';
import { sessionRouter } from '../session/session.controller.js';
import { notesRouter } from '../notes/notes.controller.js';
import { configuration } from '@/config/config.js';
import { googleRouter } from '../google/google.controller.js';

const storage: StorageEngine = memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10000000 } });
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const router = Router({ mergeParams: true });

router.use('/google', googleRouter);
router.use('/sessions', sessionRouter);
router.use('/notes', notesRouter);

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.user);

    res
      .status(200)
      .json(
        UserService.sanitizeUser(req.user, req.user?.googleAccount ?? null),
      );
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
        res.status(400).json({
          error:
            'Missing required fields: email, password, username, first_name, last_name',
        });
        return;
      }

      if (!avatar) {
        res.status(400).json({ error: 'Missing avatar' });
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(avatar.mimetype)) {
        res.status(400).json({
          error: 'Avatar must be a valid image file (png, jpeg, or jpg)',
        });
        return;
      }

      const existingUser = await UserService.retrieveUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
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
        configuration.required.JWT_SECRET ?? '',
        configuration.required.JWT_EXPIRES_IN ?? '',
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
        res.status(403).json({ error: 'User already logged in' });
        return;
      }

      const email = req.body.email;
      const password = req.body.password;

      const user = await UserService.retrieveUserByEmail(email);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isPasswordValid = comparePassword(password, user?.password ?? '');

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      const token = generateJWT(
        user.id,
        configuration.required.JWT_SECRET ?? '',
        configuration.required.JWT_EXPIRES_IN ?? '',
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
        res.status(400).json({ error: 'Missing session token' });
        return;
      }

      const session = await SessionService.retrieveSessionByToken(sessionToken);

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      await SessionService.removeSession(session.id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
);

router.put(
  '/',
  upload.single('avatar'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        first_name,
        last_name,
        email,
        username,
      }: {
        first_name: string;
        last_name: string;
        email: string;
        username: string;
      } = req.body;
      //const avatar = req.file;

      if (!first_name || !last_name || !email || !username) {
        res.status(400).json({
          error:
            'Missing required fields: first_name, last_name, email, username',
        });
        return;
      }

      /*if (avatar && !ALLOWED_MIME_TYPES.includes(avatar.mimetype)) {
        return res.status(400).json({
          error: 'Avatar must be a valid image file (png, jpeg, or jpg)',
        });
      }*/

      /*const uploadedAvatar = await FileService.uploadAvatar({
        file: avatar,
        acl: 'public-read',
      });*/

      const updatedUser = await UserService.updateUser(req.user.id, {
        id: req.user.id,
        firstName: first_name,
        lastName: last_name,
        email,
        username,
      });

      res
        .status(200)
        .json(
          UserService.sanitizeUser(
            updatedUser,
            req.user?.googleAccount ?? null,
          ),
        );
    } catch (error) {
      next(error);
    }
  },
);

export { router };
