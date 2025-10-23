const joi = require('joi')

const SignIn =  joi.object({
    email: joi.string().trim().required(),
    password: joi.string().trim().required()
})


module.exports = {SignIn}