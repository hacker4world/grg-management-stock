import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
  err: any,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  console.log(request.body);

  if (err && err.type == "body") {
    return response.status(422).json({
      message: "Veuillez verifier les données",
    });
  } else {
    console.error("🔴 Global error:", err?.message || err);
    if (err?.stack) console.error(err.stack);
    return response.status(500).json({
      message: "Un erreur est survenu",
    });
  }
}
