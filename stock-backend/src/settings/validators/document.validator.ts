import Joi from "joi";

export const documentIdParamValidator = Joi.object({
  id: Joi.number().integer().positive().required(),
});
