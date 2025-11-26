const {signInSchema, signUpSchema} = require('../schemas/user.joi')

const userService = require('../services/users.service')
const authService = require('../services/auth.service')

const {succeed, fail} = require('../util/response')
const {generateToken} = require('../util/token')
const config = require('../config/env')

const {bizLogger} = require('../util/biz_logger')

/**
 * Auth Controller
 * This class is for all the APIs servicing for sign in , sign up, sign out, and delete user's account
 */
class AuthController{

    /**
     * Sign in a user.
     *
     * This method reads the request body and checks if the data is valid.
     * If the data is not valid, it returns HTTP 400 with the validation messages.
     *
     * If the data is valid, it calls the auth service to sign in.
     * When sign-in is successful, it creates a JWT token for the user
     * and saves it in a httpOnly cookie. This cookie cannot be read from
     * client-side JavaScript. This helps protect the session.
     *
     * The method always returns an HTTP 200 response with the result from
     * the auth service, even if the cookie was not set.
     *
     * If there is an unexpected error (for example, the auth service throws),
     * it logs the error and returns HTTP 500 with a generic error message.
     *
     * Request:
     *   req.body should match signInSchema.
     *
     * Response:
     *   200: JSON result from authService.signIn(), maybe with cookie set.
     *   400: JSON with validation errors if the input is bad.
     *   500: JSON with a generic "sign in has error" message if something failed.
     */
    async signIn(req, resp){
        const {error, value} = signInSchema.validate(req.body)
        if(error){
            return resp.status(400).json(fail(1, error.details.map(d => d.message)))
        }
        try{
            const response = await authService.signIn(value)
            if(response.isSuccess()){
                const token = generateToken(response.body.sessionId)
                resp.cookie(config.cookie_name, token, {
                    httpOnly:true
                })
                delete response.body.sessionId
                const user = response.body.user
                delete response.body.user
                response.body = user
            }
            return resp.status(200).json(response)
        }catch(e){
            bizLogger.error("sign in has error", e)
            return resp.status(500).json(fail(1, "sign in has error", null))
        }
    }

    /**
     * Sign up a new user.
     *
     * This method validates the user input from the request body using signUpSchema.
     * If the data does not meet the validation rules, it returns HTTP 400
     * with a list of validation error messages.
     *
     * If the input is valid, it tries to create a new user in the system
     * by calling userService.createUser().
     *
     * When the user is created successfully, it returns HTTP 200
     * with a success message.
     *
     * If there is an error during user creation:
     *   - If the error code is 11000, it means the email already exists.
     *     In this case, it returns HTTP 200 with a "duplicate email" message.
     *   - For other errors, it logs the issue and returns HTTP 500
     *     with a general "signing up has error" message.
     *
     * Request:
     *   req.body should follow the signUpSchema rules.
     *
     * Response:
     *   200: Success message or duplicate email message.
     *   400: Validation errors if input is invalid.
     *   500: Generic error message if something unexpected happens.
     */
    async signUp(req, resp){
        const {error, value} = signUpSchema.validate(req.body)
        if(error){
            return resp.status(200).json(fail(1, error.details.map(d => d.message)))
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
    /**
     * Sign out the current user.
     *
     * This method gets the user information from the request (req.user)
     * and calls the auth service to sign the user out using their ID.
     *
     * If the sign-out process is successful, it removes the authentication cookie
     * from the client by clearing the httpOnly cookie.
     * This helps ensure the user’s session is securely ended.
     *
     * When everything works, it returns HTTP 200 with a success message.
     *
     * If an error happens during the process, it returns HTTP 500
     * with a general "signing out has error" message.
     *
     * Request:
     *   req.user must contain the logged-in user information.
     *
     * Response:
     *   200: JSON message confirming successful sign-out.
     *   500: JSON message indicating an internal server error.
     */
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

    /**
     * Delete the current user's account.
     *
     * This method gets the user information from the request (req.user)
     * and calls the auth service to permanently delete the user account.
     *
     * After the account is deleted, it also clears the authentication cookie
     * (httpOnly) so the user is automatically signed out.
     * This ensures that no active session remains after deletion.
     *
     * If the operation is successful, it returns HTTP 200
     * with a message confirming that the account was deleted and the user was signed out.
     *
     * If any error occurs during the deletion process, it logs the error
     * and returns HTTP 500 with a general "deleting account has error" message.
     *
     * Request:
     *   req.user must contain the current user information.
     *
     * Response:
     *   200: JSON message confirming successful account deletion and sign-out.
     *   500: JSON message indicating an internal server error.
     */
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

