import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utilities/jwt.util";
import { fetchCompte } from "../utilities/fetch.util";
import { Compte } from "../entity/Compte";

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: Compte;
}

export function extractToken(req: Request): string | null {
  // Prefer Authorization header over cookies (better for API testing)
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }
  // Fallback to cookie for web browsers
  const cookieToken = req.cookies?.token as string;
  return cookieToken || null;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ message: "Authentification requise" });
    return;
  }

  const result = verifyToken(token);
  if (result.success === false) {
    const errorMessages: Record<string, string> = {
      expired: "Token expiré",
      malformed: "Token malformé ou invalide",
      invalid: "Token invalide",
    };
    res.status(401).json({ message: errorMessages[result.error] });
    return;
  }

  const compte = await fetchCompte(result.payload.user_id);
  if (!compte) {
    res.status(401).json({ message: "Utilisateur introuvable" });
    return;
  }

  (req as AuthRequest).user = compte;
  next();
}
