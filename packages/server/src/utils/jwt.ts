import crypto from 'node:crypto';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { configuration } from '@/config';

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = (
  password: string,
  hashedPassword: string,
): boolean => {
  return hashPassword(password) === hashedPassword;
};

export const generateJWT = (
  id: number | string,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string | number,
): string => {
  return sign(
    {
      id,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN as string | number,
    },
  );
};

export const verifyToken = (token: string): string | JwtPayload => {
  try {
    return verify(token, configuration.required.JWT_SECRET ?? '');
  } catch (error) {
    return '';
  }
};
