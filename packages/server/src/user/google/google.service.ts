import { configuration } from '@/config';
import { chat_v1, google } from 'googleapis';
import { db } from '@/data-source';
import {
  GoogleAccount,
  googleAccounts,
  GoogleAccountStatus,
  GoogleSession,
  googleSession,
} from '@/models/schema';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { generateJWT } from '@/utils/jwt';
import { eq } from 'drizzle-orm';
import https from 'node:https';
import { z } from 'zod';
import { Response } from 'express';
import { IGoogleUserLite, IUserInfoResponse } from '@manager/common/src';

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

const scopes = [
  'openid',
  'profile',
  'email',

  // Google Chat (Get all spaces, messages, and members)
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',

  // Google Todo (Get all tasks)
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',

  // Google Workspace (See meetings)
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export const getGoogleAuthURL = (userId: number) => {
  const jwt = generateJWT(userId + configuration.dynamic.GOOGLE_STATE, 60 * 5);
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
      status: user.status as GoogleAccountStatus,
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
    const allowedScopes = credentials?.scope?.split(' ') ?? [];

    await db.insert(googleSession).values({
      googleAccountId: googleId,

      scopes: allowedScopes,

      sessionId: credentials.id_token as string,
      accessToken: credentials.access_token as string,
      refreshToken: credentials.refresh_token as string,
      expiresIn: credentials.expiry_date as unknown as string,
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

      const { data }: { data: IUserInfoResponse } =
        await googleOauth2Client.request({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });

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

  async deleteGoogleAccount(googleAccountId: number) {
    const googleSessionData = await db.query.googleSession.findMany({
      where: eq(googleSession.googleAccountId, googleAccountId),
    });

    if (googleSessionData.length === 0) {
      throw new Error('No active session found for this Google account');
    }

    for (const session of googleSessionData) {
      await GoogleService.revokeGoogleAccessKey(session);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(googleAccounts)
        .set({ status: GoogleAccountStatus.REVOKED })
        .where(eq(googleAccounts.id, googleAccountId))
        .execute();

      await tx
        .delete(googleSession)
        .where(eq(googleSession.googleAccountId, googleAccountId))
        .execute();
    });
  },

  async revokeGoogleAccessKey(googleSession: GoogleSession) {
    let postData = 'token=' + googleSession.accessToken;

    let postOptions = {
      host: 'oauth2.googleapis.com',
      port: '443',
      path: '/revoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const postReq = https.request(postOptions, function (res) {
      res.setEncoding('utf8');
      res.on('data', (d) => {
        const parsedData = z.object({
          error: z.string().optional(),
          error_description: z.string().optional(),
        });

        const parsedResponse = parsedData.safeParse(JSON.parse(d));
        if (!parsedResponse.success) {
          console.error('Error parsing response:', parsedResponse.error);
          return;
        }

        if (parsedResponse.data.error) {
          console.error('Error revoking token:', parsedResponse.data.error);
          return;
        }

        console.log('Token revoked successfully:', parsedResponse.data);
        return parsedResponse.data;
      });
    });

    postReq.on('error', (error) => {
      console.log(error);
    });

    postReq.write(postData);
    postReq.end();
  },

  async updateUserGoogleAccountStatus(
    googleAccountId: string,
    status: GoogleAccountStatus,
  ) {
    await db
      .update(googleAccounts)
      .set({ status: status })
      .where(eq(googleAccounts.googleId, googleAccountId))
      .execute();
  },

  closeGoogleCallback(res: Response, location: string) {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
      <html>
      <head></head>
      <body>
        <script>
        if (window.opener) {
          window.opener.location.href = '${configuration.required.FRONTEND_URL}auth/google/callback?success=true';
          window.close();
        } else {
          window.location.href = '${configuration.required.FRONTEND_URL}auth/google/callback?success=true';
        }
        </script>
        <p>Redirecting...</p>
      </body>
      </html>
    `);
    res.end();
  },

  async getRecentGoogleChats(googleAccountId: number) {
    const session = await db.query.googleSession.findFirst({
      where: eq(googleSession.googleAccountId, googleAccountId),
    });

    if (!session) {
      throw new Error('No active session found for this Google account');
    }

    // Check if we have a scope
    const requiredScope =
      'https://www.googleapis.com/auth/chat.spaces.readonly';

    if (!session.scopes.includes(requiredScope)) {
      throw new Error(
        `Google account does not have the required scope: ${requiredScope}`,
      );
    }

    const chat = google.chat({
      version: 'v1',
      auth: googleOauth2Client,
    });

    const spacesResponse = await chat.spaces.list({
      pageSize: 10,
    });

    const spaces = spacesResponse.data.spaces || [];

    const recentChats: {
      space: chat_v1.Schema$Space;
      message: chat_v1.Schema$Message;
    }[] = [];

    for (const space of spaces) {
      const messagesResponse = await chat.spaces.messages.list({
        parent: space.name ?? '',
        pageSize: 10,
      });

      const messages = messagesResponse.data.messages || [];

      for (const message of messages) {
        recentChats.push({
          space: space,
          message: message,
        });
      }
    }

    return recentChats;
  },
};
