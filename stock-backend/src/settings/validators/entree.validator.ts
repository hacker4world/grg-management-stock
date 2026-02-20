import Joi = require("joi");

const ajouterEntreeValidator = Joi.object({
  articleId: Joi.number().integer().positive().required(),
  observation: Joi.string().allow("").optional().default(null),
  prix: Joi.number().positive().required(),
  fournisseurId: Joi.number().integer().positive().required(),
  fabriquantId: Joi.number().integer().positive().required(),
  stockEntree: Joi.number().integer().positive().required(),
  compteId: Joi.number().integer().positive().required(),
  items: Joi.array()
    .items(
      Joi.object({
        articleId: Joi.number().integer().positive().required(),
        stockEntree: Joi.number().integer().positive().required(),
        prix: Joi.number().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

const confirmerEntreeValidator = Joi.object({
  entreeId: Joi.number().integer().positive().required(),
  action: Joi.string().valid("confirm", "deny").required(),
});



export { ajouterEntreeValidator, confirmerEntreeValidator };
