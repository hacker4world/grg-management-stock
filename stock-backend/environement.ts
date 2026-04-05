import { CookieOptions } from "express";

const isProduction = false;

export const cookieSettings: CookieOptions = {
  secure: false,
  httpOnly: false,
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};
