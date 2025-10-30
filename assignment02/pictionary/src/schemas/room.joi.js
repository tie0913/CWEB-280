const Joi = require('joi');

const createRoomSchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required(),
    maxPlayers: Joi.number().integer().min(2).max(20).required(),
    visibility: Joi.number().valid(0,1).required(),
});

const listRoomsSchema = Joi.object({
  query: Joi.string().allow('', null),
  visibility: Joi.number().valid(0,1),
  state: Joi.number().valid(0,1,2,3),
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(50).default(20)
});

module.exports = { createRoomSchema, listRoomsSchema };