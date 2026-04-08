import { CookieOptions } from "express";

const isProduction = true;

export const cookieSettings: CookieOptions = {
  secure: isProduction,
  httpOnly: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};
