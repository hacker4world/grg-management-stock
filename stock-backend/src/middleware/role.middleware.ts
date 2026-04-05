import { Request, Response, NextFunction } from "express";
import { Role } from "../enums/role.enum";
import { AuthRequest } from "./auth.middleware";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    console.log(`Role middleware : Attached user : ${authReq.user}`);
    

    if (!authReq.user) {
      res.status(401).json({ message: "Authentification requise" });
      return;
    }
    const userRole = authReq.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Rôle insuffisant" });
      return;
    }
    next();
  };
}
