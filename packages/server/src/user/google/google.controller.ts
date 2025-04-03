import { NextFunction, Request, Response, Router } from 'express';
import { getGoogleAuthURL, GoogleService } from './google.service';
import { configuration } from '@/config';
import url from 'url';
import { verifyToken } from '@/utils/jwt';
import { GoogleAccountStatus } from '@/models/schema';
import { UserService } from '../core/user.service';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *  name: Google
 * description: Google authentication
 */
router.get('/auth', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      !req.user.googleAccount?.id ||
      req.user.googleAccount?.status !== GoogleAccountStatus.REVOKED
    ) {
      res.status(400).json({
        error: 'Google account is already connected or not found',
      });
      return;
    }

    const authURL = getGoogleAuthURL(req.user.id);

    res.status(200).json({
      authURL,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const q = url.parse(req.url, true).query;

    if (q.error) {
      console.error('Google authentication error:', q.error);

      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
      );
      return;
    }

    const state = q.state as string;
    const jwt = state.split(configuration.dynamic.GOOGLE_STATE)[1];
    if (!jwt) {
      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
      );
      return;
    }

    const decodedJwt = verifyToken(jwt) as unknown as {
      id: string;
    } | null;

    if (!decodedJwt) {
      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
      );
      return;
    }

    const userId = decodedJwt.id.split(configuration.dynamic.GOOGLE_STATE)[0];
    if (!userId) {
      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
      );
      return;
    }

    const user = await UserService.retrieveUser(parseInt(userId));
    if (!user) {
      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
      ),
        console.log('User not found:', userId);
      return;
    }

    const code = q.code as string;

    const userInformation = await GoogleService.getUserInfo(code);
    console.log('User information:', userInformation);

    if (user.googleAccount?.status === GoogleAccountStatus.REVOKED) {
      console.log('User account is revoked, updating status to active');
      await GoogleService.updateUserGoogleAccountStatus(
        userInformation.ticket.sub,
        GoogleAccountStatus.ACTIVE,
      );

      await GoogleService.createUserWithSession(
        user.googleAccount.id,
        userInformation.tokens,
      );

      GoogleService.closeGoogleCallback(
        res,
        `${configuration.required.FRONTEND_URL}auth/google/callback?success=true`,
      );
      return;
    }

    const id = await GoogleService.createUserWithGoogle(
      parseInt(userId),
      userInformation.userData,
      userInformation.ticket.sub,
    );

    await GoogleService.createUserWithSession(id, userInformation.tokens);

    GoogleService.closeGoogleCallback(
      res,
      `${configuration.required.FRONTEND_URL}auth/google/callback?success=true`,
    );
  } catch (error) {
    GoogleService.closeGoogleCallback(
      res,
      `${configuration.required.FRONTEND_URL}auth/google/callback?success=false`,
    );
    console.error('Error during Google authentication:', error);
  }
});

router.post(
  '/revoke',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(400).json({ error: 'No Google account found' });
        return;
      }

      if (user.googleAccount?.status !== GoogleAccountStatus.ACTIVE) {
        res.status(400).json({
          error: 'Google account is not active or already revoked',
        });
        return;
      }

      await GoogleService.deleteGoogleAccount(user.googleAccount.id);

      res.status(200).json({ revoked: true });
    } catch (error) {
      next(error);
    }
  },
);

export const googleRouter = router;
