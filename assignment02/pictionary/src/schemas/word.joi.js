const Joi = require('joi');
const { DIFFICULTY_LEVELS } = require('../constants/WordConstants');

const createWordSchema = Joi.object({
    word: Joi.string().min(1).required(),
    difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).required(),
})

const updateWordSchema = Joi.object({
    id: Joi.string().uuid().required(),
    word: Joi.string().min(1).required(),
    difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).required(),
})

const listWordsSchema = Joi.object({
    query: Joi.string().min(1).optional(),
    difficulty: Joi.string().valid(...DIFFICULTY_LEVELS),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
})

module.exports = { createWordSchema, updateWordSchema, listWordsSchema };