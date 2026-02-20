import { Request, Response } from "express";

export function rateLimitHandler(request: Request, response: Response) {
  return response.status(429).json({
    message: "Api rate limit exceeded, Try again later",
  });
}
