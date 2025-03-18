import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-for-development';

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign a JWT token with user information
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn = '7d'): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn },
      (err, token) => {
        if (err) return reject(err);
        if (!token) return reject(new Error('Failed to generate token'));
        resolve(token);
      }
    );
  });
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyJWT(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      JWT_SECRET,
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as JWTPayload);
      }
    );
  });
} 