const joi = require('joi')

const signInSchema =  joi.object({
    email: joi.string().trim().required(),
    password: joi.string().trim().required()
})

const signUpSchema = joi.object({
    email: joi.string().trim().email().required(),
    password:joi.string().trim().required(),
    name:joi.string().trim().min(3).max(100).required()
})


module.exports = {signInSchema, signUpSchema}