import Joi from 'joi';
import { MindVisibility } from '../models/mind';
import { MindCreativity, MindOutputType } from '../models/mind-task';

export const mindCreationSchema = Joi.object({
  title: Joi.string().required(),
  prompt: Joi.string().required(),
  visibility: Joi.string()
    .valid(...Object.values(MindVisibility))
    .required(),
  outputType: Joi.string()
    .valid(...Object.values(MindOutputType))
    .required(),
  creativity: Joi.string()
    .valid(...Object.values(MindCreativity))
    .required()
}).unknown();
