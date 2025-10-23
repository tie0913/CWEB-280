const jwt = require('jsonwebtoken')
const config = require('../config/env')

function generateToken(userId){
    return jwt.sign({content:String(userId)}, config.jwt_secret)
}

function resolveToken(token){
    const payload = jwt.verify(token, config.jwt_secret)
    return payload['content']
}

module.exports = {generateToken, resolveToken}