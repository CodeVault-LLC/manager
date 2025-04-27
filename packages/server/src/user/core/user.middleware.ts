import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@/utils/jwt.js';
import { UserService } from './user.service.js';
import { SessionService } from '../session/session.service.js';

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ignoredPaths = [
      {
        path: /^\/users\/login\/?$/,
        method: 'POST',
      },
      {
        path: /^\/users\/register\/?$/,
        method: 'POST',
      },
      {
        path: /^\/users\/\d+\/avatar$/,
        method: 'GET',
      },
      {
        path: /^\/users\/google\/callback\/?$/,
        method: 'GET',
      },
    ];

    const isIgnoredPath = ignoredPaths.some(
      (ignoredPath) =>
        ignoredPath.path.test(req.path) && req.method === ignoredPath.method,
    );

    if (isIgnoredPath) {
      next();
      return;
    }

    console.log('Middleware triggered for path:', req.path);

    const authorizationHeader = req.headers.authorization;
    const xSystemHeader = req.headers['x-system'] as string | undefined;

    if (!authorizationHeader || !xSystemHeader) {
      res.status(401).send('Unauthorized');
      return;
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      res.status(401).send('Unauthorized');
      return;
    }

    const decodedToken = verifyToken(token) as unknown as {
      id: number;
    } | null;

    if (!decodedToken) {
      res.status(401).send('Unauthorized');
      return;
    }

    const session = await SessionService.retrieveSessionByToken(token);
    if (!session) {
      res.status(401).send('Unauthorized');
      return;
    }

    const user = await UserService.retrieveUser(session.userId);
    if (!user) {
      res.status(401).send('Unauthorized');
      return;
    }

    await SessionService.updateDateLastUsedAt(session.id);

    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};
