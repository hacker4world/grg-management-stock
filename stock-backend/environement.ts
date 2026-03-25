import { CookieOptions } from "express";

const isProduction = false;

export const cookieSettings: CookieOptions = {
  secure: false,
  httpOnly: true,
  sameSite: "none",
};
