import Joi from 'joi';

// Schema for validating currency data
export const currencySchema = Joi.object({
  _id: Joi.string()
    .pattern(/^[A-Z]{3}$/)
    .required()
    .description('Currency code (3 uppercase letters)'),
  rate: Joi.number()
    .min(0)
    .required()
    .description('Exchange rate value')
});
