import { configuration } from '@/config';
import { google } from 'googleapis';
import { IUserInfoResponse, IGoogleUserLite } from '@shared/types/google';
import { db } from '@/data-source';
import { GoogleAccount, googleAccounts, googleSession } from '@/models/schema';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { generateJWT } from '@/utils/jwt';

export let googleOauth2Client: OAuth2Client = {} as OAuth2Client;

export const initGoogleClient = () => {
  googleOauth2Client = new google.auth.OAuth2(
    configuration.required.GOOGLE_CLIENT_ID,
    configuration.required.GOOGLE_CLIENT_SECRET,
    configuration.required.GOOGLE_REDIRECT_URL,
  );

  if (googleOauth2Client.gaxios) {
    googleOauth2Client.gaxios.defaults.errorRedactor = (error) => {
      if (error.response) {
        const { data, config, headers } = error.response;
        return {
          data: data,
          config: config,
          headers: headers,
        };
      }
      return error;
    };
  }
};

const scopes = ['openid', 'profile', 'email'];

export const getGoogleAuthURL = (userId: number) => {
  const jwt = generateJWT(
    userId + configuration.dynamic.GOOGLE_STATE,
    configuration.required.JWT_SECRET,
    '5m',
  );
  const state = configuration.dynamic.GOOGLE_STATE + jwt;

  return googleOauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    redirect_uri: configuration.required.GOOGLE_REDIRECT_URL,
    client_id: configuration.required.GOOGLE_CLIENT_ID,
    prompt: 'consent',
    response_type: 'code',
  });
};

export const GoogleService = {
  sanitizeGoogleData(user: GoogleAccount): IGoogleUserLite {
    return {
      name: user.name,
      email: user.email,
      picture: user.picture,
      given_name: user.givenName,
      email_verified: user.emailVerified,
    };
  },

  createUserWithGoogle: async (
    userId: number,
    userInfo: IUserInfoResponse,
    googleId: string,
  ): Promise<number> => {
    if (!userId) {
      throw new Error('User ID is required to create a Google account');
    }

    const googleAccount = await db
      .insert(googleAccounts)
      .values({
        userId,
        googleId,

        name: userInfo.name,
        email: userInfo.email,
        givenName: userInfo.given_name,
        picture: userInfo.picture,
        emailVerified: userInfo.email_verified,
      })
      .returning({ id: googleAccounts.id });

    return googleAccount[0].id;
  },

  createUserWithSession: async (googleId: number, credentials: Credentials) => {
    await db.insert(googleSession).values({
      googleAccountId: googleId,
      sessionId: credentials.id_token as string,
      accessToken: credentials.access_token as string,
      refreshToken: credentials.refresh_token as string,
      expiresIn: credentials.expiry_date as number,
    });
  },

  async getUserInfo(code: string) {
    try {
      const { tokens } = await googleOauth2Client.getToken({
        code: code,
        client_id: configuration.required.GOOGLE_CLIENT_ID,
      });

      googleOauth2Client.setCredentials(tokens);

      const ticket = await googleOauth2Client.verifyIdToken({
        idToken: tokens.id_token as string,
        audience: configuration.required.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid ID token');
      }

      // Get user info from Google
      const { data }: { data: IUserInfoResponse } =
        await googleOauth2Client.request({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

      console.log('Google user data:', data);

      return {
        tokens: tokens,
        ticket: payload,
        userData: data,
      };
    } catch (error) {
      console.error('Error getting tokens from Google:', error);
      throw new Error('Failed to get tokens from Google');
    }
  },
};
