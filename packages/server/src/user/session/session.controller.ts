import { NextFunction, Request, Response, Router } from 'express';
import { SessionService } from './session.service';

const router = Router({ mergeParams: true });

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const sessionId = req.session.id;

    const sessions = await SessionService.getAllSessions(userId);

    const finalizedSessions = sessions.map((session) => {
      return {
        ...session,
        isCurrentSession: session.id === sessionId,
      };
    });

    res.status(200).json(finalizedSessions);
  } catch (error) {
    next(error);
  }
});

router.delete(
  '/all',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userSessionId = req.session.id;
      const userId = req.user.id;

      await SessionService.removeAllSessions(userId, [userSessionId]);

      res.status(200).json({ message: 'All sessions deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:sessionId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentSessionId = req.session.id;
      const sessionId = +req.params.sessionId;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      if (sessionId === currentSessionId) {
        return res.status(400).json({ error: 'Cannot delete current session' });
      }

      await SessionService.removeSession(sessionId);

      res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
);

export const sessionRouter = router;
