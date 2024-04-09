import Joi from 'joi';

export const mindCreationSchema = Joi.object({
  title: Joi.string().required(),
  prompt: Joi.string().required()
}).unknown();
