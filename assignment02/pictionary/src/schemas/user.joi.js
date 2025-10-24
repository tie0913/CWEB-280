const joi = require('joi')

const signInSchema =  joi.object({
    email: joi.string().trim().required(),
    password: joi.string().trim().required()
})


module.exports = {signInSchema}