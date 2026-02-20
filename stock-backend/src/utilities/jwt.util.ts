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
      // Covers: malformed token, invalid signature, etc.
      return { success: false, error: "malformed" };
    }
    return { success: false, error: "invalid" };
  }
};
