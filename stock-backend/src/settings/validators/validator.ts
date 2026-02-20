import { createValidator } from "express-joi-validation";

export const requestBodyValidator = createValidator({
  passError: true,
});
