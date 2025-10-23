const {SignIn} = require('../schemas/user.joi')

const userSerivce = require('../services/users.service')

const {succeed, fail} = require('../util/response')
const {generateToken} = require('../util/token')
const config = require('../config/env')

const {bizLogger} = require('../util/biz_logger')

class AuthController{

    constructor(){
        this.userService = userSerivce
    }

    async signIn(req, resp){
        const {error, value} = SignIn.validate(req.body)
        if(error){
            return resp.status(400).json(fail(1, error.details.map(d => d.message)))
        }
        try{
            const user = await this.userService.getUserByEmail(value.email)
            if(user != null && user.password === value.password){
                const token = generateToken(user._id.toString())
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
            return resp.status(400).json(fail(1, 'sign in has error'))
        }
    }


    signUp(req, resp){
        console.log("This is sign up")
    }

    signOut(req, resp){

        console.log("This is sign out")
    }

}


module.exports = new AuthController()

