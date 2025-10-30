const jwt = require('jsonwebtoken')
const config = require('../config/env')

/**
 * Generate and verify JWT tokens.
 *
 * generateToken(content):
 *   Creates a signed JWT containing the given content.
 *
 */

function generateToken(content){
    return jwt.sign({content:String(content)}, config.jwt_secret)
}

/**
 * 
 * resolveToken(token):
 * Verifies the token and returns its original content.
 */
function resolveToken(token){
    const payload = jwt.verify(token, config.jwt_secret)
    return payload['content']
}

module.exports = {generateToken, resolveToken}