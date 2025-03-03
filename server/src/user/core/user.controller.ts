import { NextFunction, Request, Response, Router } from 'express';
import { UserService } from './user.service.js';

const router = Router({ mergeParams: true });

router.get('/me', (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json(UserService.sanitizeUser(req.user));
  } catch (error) {
    next(error);
  }
});

export { router };
