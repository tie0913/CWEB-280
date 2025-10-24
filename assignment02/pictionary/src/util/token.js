const jwt = require('jsonwebtoken')
const config = require('../config/env')

function generateToken(content){
    return jwt.sign({content:String(content)}, config.jwt_secret)
}

function resolveToken(token){
    const payload = jwt.verify(token, config.jwt_secret)
    return payload['content']
}

module.exports = {generateToken, resolveToken}