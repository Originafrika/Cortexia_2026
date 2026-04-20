import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET
);

const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

export interface JWTPayload {
  sub: string;
  email?: string;
  organizationId?: string;
  roles?: string[];
}

export async function signToken(payload: JWTPayload, expirySeconds?: number): Promise<string> {
  const expiresIn = expirySeconds || DEFAULT_EXPIRY_SECONDS;
  
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      sub: payload.sub as string,
      email: payload.email as string | undefined,
      organizationId: payload.organizationId as string | undefined,
      roles: payload.roles as string[] | undefined,
    };
  } catch {
    return null;
  }
}

export async function decodeToken(token: string): Promise<JWTPayload | null> {
  return verifyToken(token);
}