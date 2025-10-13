import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string | null;
  role: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: '15m',
      }
    );
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      JWT_REFRESH_SECRET,
      {
        expiresIn: '7d',
      }
    );
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
  }

  static generateTokens(user: Pick<User, 'id' | 'email' | 'role'>) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }
}