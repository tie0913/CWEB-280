const {signInSchema, signUpSchema} = require('../schemas/user.joi')

const userService = require('../services/users.service')
const sessionService = require('../services/session.service')

const {succeed, fail} = require('../util/response')
const {generateToken} = require('../util/token')
const config = require('../config/env')

const {bizLogger} = require('../util/biz_logger')

class AuthController{

    async signIn(req, resp){
        const {error, value} = signInSchema.validate(req.body)
        if(error){
            return resp.status(400).json(fail(1, error.details.map(d => d.message)))
        }
        try{
            const user = await userService.getUserByEmail(value.email)
            if(user != null && user.password === value.password){

                const sessionId = await sessionService.createSession(user['_id'])

                const token = generateToken(sessionId)

                resp.cookie(config.cookie_name, token, {
                    httpOnly:true
                })
                bizLogger.info('we have got user ' + user.email + ' signing in')
                return resp.status(200).json(succeed("sign in succeed"));
            }else{
                return resp.status(400).json(fail(1, 'email and password does not match'))
            }
        }catch(e){
            console.log(e)
            return resp.status(500).json(fail(1, 'sign in has error'))
        }
    }


    async signUp(req, resp){
        const {error, value} = signUpSchema.validate(req.body)
        if(error){
            return resp.status(400).json(fail(1, error.details.map(d => d.message)))
        }

        try{
            await userService.createUser(value)
            return resp.status(200).json(succeed("signing up has been successful"))
        }catch(e){
            bizLogger.error("sign up has error", e)
            if(e.code === 11000){
                return resp.status(200).json(fail(1, "duplicate email", null))
            }else{
                return resp.status(500).json(fail(1, "signing up has error", null))
            }
        }

    }

    async signOut(req, resp){
        const user = req.user
        try{
            await sessionService.deleteSessionByUserId(user['_id'])
            resp.clearCookie(config.cookie_name, {
                httpOnly:true
            })
            return resp.status(200).json(succeed("you have signed out successfully"))
        }catch(e){
            return resp.status(500).json(fail(1,"Signing out has erro", null))
        }
    }

}


module.exports = new AuthController()

