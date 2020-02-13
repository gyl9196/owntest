const Joi = require('@hapi/joi');
const schema = Joi.object({
  firstName: Joi.string()
    .max(20)
    .required().label('Given name'),
  lastName: Joi.string()
    .max(20)
    .required().label('Family name'),
  email: Joi.string()
    .email({ tlds: false })
    .required()
}).options({ abortEarly: true });

module.exports = schema;
