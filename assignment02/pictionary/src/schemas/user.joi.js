const joi = require('joi')
const {STATUS} = require('../constants/UserConstants')

const signInSchema =  joi.object({
    email: joi.string().trim().required(),
    password: joi.string().trim().required()
})

const signUpSchema = joi.object({
    email: joi.string().trim().email().required(),
    password:joi.string().trim().required(),
    name:joi.string().trim().min(3).max(100).required()
})

const updateUserSchema = joi.object({
    _id:joi.string().trim().required(),
    email:joi.string().trim().email().required(),
    password:joi.string().trim().optional().invalid(''),
    name:joi.string().trim().min(3).max(100).required()
})

const updateUserByAdminSchema = joi.object({
    _id:joi.string().trim().required(),
    email:joi.string().trim().email().required(),
    name:joi.string().trim().min(3).max(100).required(),
    admin:joi.boolean().required(),
    status:joi.number().valid(...STATUS.map(d => d.code)).required()
})

module.exports = {signInSchema, signUpSchema, updateUserSchema, updateUserByAdminSchema}