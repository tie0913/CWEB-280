const config = require('../config/env')
const {ObjectId} = require('mongodb')
const {resolveToken} = require('../util/token')
const sessionService = require('../services/auth.service')
const userService = require('../services/users.service')
const {fail, succeed} = require('../util/response')
const { bizLogger } = require('../util/biz_logger')


async function verifyUser(token){
    let sessionId
    try{
        sessionId = resolveToken(token)
    }catch(e){
        bizLogger.error('token resolve error', e)
        return fail(1, "resolving token has errors", null)
    }

    try{
        const session = await sessionService.getSession(new ObjectId(sessionId))
        bizLogger.info(session)
        bizLogger.info(new Date())
        if(session == null){
            return fail(2, "no session has been found by current session id, you need to sign in again", null)
        }else if(new Date() > session['expireAt']){
            return fail(3, "session has expired, you need to sign in again", null)
        }

        const user = await userService.getUserByObjectId(session['userId'])
        if(user == null){
            return fail(4, "cannot find user, you need to sign in again or contact admin to verify your account", null)
        }else{
            return succeed(user)
        }

    }catch(e){
        bizLogger.error("auth validator error", e)
        return fail(-1, "Server Error", null)
    }
}

/**
 * verify if the user has signed in
 * @param  req 
 * @param  resp 
 * @param  next 
 * @returns 
 */
async function authValidator(req, resp, next){
    const token = req.cookies[config.cookie_name]
    if(token == null){
        return resp.status(401).json(fail(1, "Token does not exist, please sign in"))
    }
    const verification = await verifyUser(token)
    if(verification.isSuccess()){
        req.user = verification.body
        next()
    }else{
        bizLogger.info(verification)
        const httpStatus = verification.code == -1 ?  500 : 401
        return resp.status(httpStatus).json(verification)
    }
}

/**
 * verify if the user is administrative
 * @param req 
 * @param resp 
 * @param next 
 * @returns 
 */
async function adminValidator(req, resp, next){
    if(req.user['admin']){
       next()
    }else{
       return resp.status(401).json(fail(5, "insufficiant authorities", null))
    }
}

module.exports = {authValidator, adminValidator}