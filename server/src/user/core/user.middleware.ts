import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@/utils/jwt.js';
import { UserService } from './user.service.js';

export const userMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ignoredPaths = [
      {
        path: /^\/users\/login$/,
        method: 'POST',
      },
      {
        path: /^\/users\/register$/,
        method: 'POST',
      },
      {
        path: /^\/users\/\d+\/avatar$/,
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

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
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

    const user = await UserService.retrieveUser(decodedToken.id);
    if (!user) {
      res.status(401).send('Unauthorized');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
