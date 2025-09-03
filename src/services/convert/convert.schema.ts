import Joi from 'joi';

export const convertSchema = Joi.object({
  from: Joi.string()
    .required()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{3}$/)
    .messages({
      'string.pattern.base': 'Currency code must be exactly 3 uppercase letters'
    }),
  to: Joi.string()
    .required()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{3}$/)
    .messages({
      'string.pattern.base': 'Currency code must be exactly 3 uppercase letters'
    }),
  amount: Joi.number()
    .required()
    .positive()
    .precision(2)
    .messages({
      'number.positive': 'Amount must be a positive number',
      'number.precision': 'Amount must have exactly 2 decimal places'
    })
}).custom((value, helpers) => {
  if (value.from === value.to) {
    return helpers.error('custom.sameCurrency', {
      message: 'Source and target currencies must be different'
    });
  }
  return value;
});
