import { BadRequest } from "@feathersjs/errors";
import type { HookFunction, ServiceInterface } from "@feathersjs/feathers";
import type { Schema } from "joi";
import type { Application } from '../declarations';

/**
 * A generic hook factory for Joi schema validation in Feathers services.
 * 
 * This hook validates the incoming data against a provided Joi schema before
 * the service method is executed. It can be used with any Feathers service
 * and any Joi schema.
 * 
 * @example
 * ```typescript
 * // In your service configuration:
 * app.service('servicePath').hooks({
 *   before: {
 *     create: [validateSchema(yourJoiSchema)]
 *   }
 * });
 * 
 * // With explicit service type:
 * validateSchema<YourServiceType>(yourJoiSchema)
 * ```
 * 
 * @param schema - The Joi schema to validate against
 * @template S - The service type (extends ServiceInterface)
 * @throws {BadRequest} If validation fails, with detailed error messages
 * @returns A hook function that validates data against the schema
 */
export const validateSchema = <S extends ServiceInterface = any>(schema: Schema): HookFunction<Application, S> => {
  return async context => {
    const { error, value } = schema.validate(context.data, {
      abortEarly: false,
      convert: true
    });

    if (error) {
      throw new BadRequest('Invalid input data', {
        errors: error.details.map(detail => ({
          message: detail.message,
          path: detail.path
        }))
      });
    }

    // Replace the data with the validated value
    context.data = value;
    return context;
  };
};
