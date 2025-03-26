import { NextFunction, Request, Response, Router } from 'express';
import { getGoogleAuthURL, GoogleService } from './google.service';
import { configuration } from '@/config';
import url from 'url';
import { verifyToken } from '@/utils/jwt';

const router = Router({ mergeParams: true });

router.get('/auth', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.googleAccount && req.user.googleAccount.id) {
      return next(
        new Error('User is already authenticated with Google. Please log in.'),
      );
    }

    const authURL = getGoogleAuthURL(req.user.id);

    res.status(200).json({
      authURL,
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/callback',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = url.parse(req.url, true).query;

      if (q.error) {
        res.redirect(
          `${configuration.required.FRONTEND_URL}/auth/google/callback?success=false`,
        );
        return;
      }

      // The state includes a jwt token and a random string. Extract the random string, but ensure it exists within the state, then extract the jwt token.
      const state = q.state as string;
      const jwt = state.split(configuration.dynamic.GOOGLE_STATE)[1];
      if (!jwt) {
        res.redirect(
          `${configuration.required.FRONTEND_URL}/auth/google/callback?success=false`,
        );
        return;
      }

      const decodedJwt = verifyToken(jwt) as unknown as {
        id: string;
      } | null;

      if (!decodedJwt) {
        res.redirect(
          `${configuration.required.FRONTEND_URL}/auth/google/callback?success=false`,
        );
        return;
      }

      const userId = decodedJwt.id.split(configuration.dynamic.GOOGLE_STATE)[0];

      if (!userId) {
        res.redirect(
          `${configuration.required.FRONTEND_URL}/auth/google/callback?success=false`,
        );
        return;
      }

      const code = q.code as string;

      const userInformation = await GoogleService.getUserInfo(code);

      const id = await GoogleService.createUserWithGoogle(
        parseInt(userId),
        userInformation.userData,
        userInformation.ticket.sub,
      );

      await GoogleService.createUserWithSession(id, userInformation.tokens);

      res.redirect(
        `${configuration.required.FRONTEND_URL}/auth/google/callback?success=true`,
      );
    } catch (error) {
      console.error('Error during Google authentication:', error);

      res.redirect(
        `${configuration.required.FRONTEND_URL}/auth/google/callback?success=false`,
      );
    }
  },
);

export const googleRouter = router;
