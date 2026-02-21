import { sign, verify, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export const generateToken = (payload: object) => {
  return sign(payload, SECRET_KEY, { expiresIn: 36000 });
};

export type VerifyTokenResult = 
  | { success: true; payload: { user_id: number } }
  | { success: false; error: "expired" | "invalid" | "malformed" };

export const verifyToken = (token: string): VerifyTokenResult => {
  try {
    const payload = verify(token, SECRET_KEY) as { user_id: number };
    return { success: true, payload };
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return { success: false, error: "expired" };
    }
    if (err instanceof JsonWebTokenError) {
      return { success: false, error: "malformed" };
    }
    return { success: false, error: "invalid" };
  }
};

const MAX_REFRESH_WINDOW = 7 * 24 * 3600; // 7 days

export const verifyExpiredToken = (token: string): VerifyTokenResult => {
  try {
    const payload = verify(token, SECRET_KEY, { ignoreExpiration: true }) as {
      user_id: number;
      iat: number;
      exp: number;
    };
    const now = Math.floor(Date.now() / 1000);
    if (now - payload.exp > MAX_REFRESH_WINDOW) {
      return { success: false, error: "expired" };
    }
    return { success: true, payload: { user_id: payload.user_id } };
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      return { success: false, error: "malformed" };
    }
    return { success: false, error: "invalid" };
  }
};
