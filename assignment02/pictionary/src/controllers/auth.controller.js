const {signInSchema, signUpSchema} = require('../schemas/user.joi')

const userService = require('../services/users.service')
const authService = require('../services/auth.service')

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
            const response = await authService.signIn(value)
            if(response.isSuccess()){
                const token = generateToken(response.body)
                resp.cookie(config.cookie_name, token, {
                    httpOnly:true
                })
            }
            return resp.status(200).json(response)
        }catch(e){
            bizLogger.error("sign in has error", e)
            return resp.status(500).json(fail(1, "sign in has error", null))
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
            await authService.signOut(user['_id'])
            resp.clearCookie(config.cookie_name, {
                httpOnly:true
            })
            return resp.status(200).json(succeed("you have signed out successfully"))
        }catch(e){
            return resp.status(500).json(fail(1,"Signing out has error", null))
        }
    }


    async deleteAccount(req, resp){
        const user = req.user
        try{
            await authService.deleteAccount(user)
            resp.clearCookie(config.cookie_name, {
                httpOnly:true
            })
            return resp.status(200).json(succeed("you have deleted your account and signed out"))
        }catch(e){
            bizLogger.error('deleting account has error', e)
            return resp.status(500).json(fail(1, "Deleting account has error", null))
        }
    }

}


module.exports = new AuthController()

