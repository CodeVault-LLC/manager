import { NextFunction, Request, Response, Router } from 'express';
import { GoogleService } from '../google.service';

const router = Router({ mergeParams: true });

router.get(
  'recent',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const googleAccountId = req.user.googleAccount?.id;

      if (!googleAccountId) {
        res.status(400).json({
          error: 'Google account is not connected',
        });
        return;
      }

      const recentChats = await GoogleService.getRecentGoogleChats(
        googleAccountId,
      );

      res.status(200).json({
        data: recentChats,
      });
    } catch (error) {
      next(error);
    }
  },
);

export const googleChatRouter = router;
