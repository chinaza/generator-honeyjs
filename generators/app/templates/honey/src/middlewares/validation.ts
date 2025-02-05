import { handleHttpError, HttpError, Middleware } from '@chinaza/honey';
import { ObjectSchema, ValidationOptions } from 'joi';

export const validateRequestData =
  (
    schema: ObjectSchema,
    location: 'body' | 'params' | 'query' | 'headers' | 'cookies' = 'body',
    options: ValidationOptions = { allowUnknown: true }
  ): Middleware =>
  async (req, res, next) => {
    try {
      const validationResult = schema.validate(req[location], options);
      const validationError = validationResult.error?.message;
      if (validationError) {
        throw new HttpError(validationError, 422);
      }

      return next();
    } catch (error) {
      handleHttpError(error, res);
    }
  };

export default validateRequestData;
