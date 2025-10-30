const config = require('../config/env')
const {ObjectId} = require('mongodb')
const {resolveToken} = require('../util/token')
const sessionService = require('../services/auth.service')
const userService = require('../services/users.service')
const {fail, succeed} = require('../util/response')
const { bizLogger } = require('../util/biz_logger')


/**
 * Verify a user based on the provided authentication token.
 *
 * This function checks whether the token is valid, not expired,
 * and linked to an active user account.
 *
 * Step 1: Token Validation
 *   - It first tries to resolve the token using resolveToken().
 *   - If the token cannot be resolved, it logs the error and returns a failure
 *     message indicating a token parsing issue.
 *
 * Step 2: Session Validation
 *   - It retrieves the session by sessionId using sessionService.getSession().
 *   - If the session does not exist, it returns a message telling the user
 *     to sign in again.
 *   - If the session has expired (current time is after session.expireAt),
 *     it also asks the user to sign in again.
 *
 * Step 3: User Validation
 *   - It fetches the user linked to the session using userService.getUserByObjectId().
 *   - If no user is found, it returns a message advising the user to sign in again
 *     or contact an admin for account verification.
 *   - If everything is valid, it returns success with the user data.
 *
 * Step 4: Error Handling
 *   - Any unexpected errors are logged, and a general "Server Error" message is returned.
 *
 * Parameters:
 *   token (string): The authentication token provided by the client.
 *
 * Returns:
 *   Success: { status: succeed, body: user }
 *   Failure: { status: fail, code: number, message: string }
 *     - 1: Token cannot be resolved.
 *     - 2: Session not found.
 *     - 3: Session expired.
 *     - 4: User not found.
 *     - -1: Server error.
 */
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
 * Middleware to validate user authentication before accessing protected routes.
 *
 * This function checks if the incoming request has a valid authentication token
 * stored in cookies. If the token exists, it verifies the user and attaches the
 * user information to the request object for downstream handlers.
 *
 * Step 1: Check for Token
 *   - It reads the token from the request cookies using the configured cookie name.
 *   - If no token is found, it immediately returns HTTP 401 with a message
 *     asking the user to sign in.
 *
 * Step 2: Verify User
 *   - It calls verifyUser(token) to validate the session and retrieve the user.
 *   - If verification is successful, the user data is saved in req.user,
 *     and next() is called to continue the request pipeline.
 *
 * Step 3: Handle Verification Failure
 *   - If verification fails, it sends an HTTP 401 response for most errors,
 *     or HTTP 500 if the verification process itself failed (code == -1).
 *
 * Request:
 *   Must include a valid authentication cookie.
 *
 * Response:
 *   200: (When passed to next middleware)
 *   401: If token is missing or invalid.
 *   500: If an internal server error occurs during verification.
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
        const httpStatus = verification.code == -1 ?  500 : 401
        return resp.status(httpStatus).json(verification)
    }
}


/**
 * Middleware to verify that the current user has admin privileges.
 *
 * This function assumes that the request has already passed through
 * the authentication middleware, so req.user is available.
 *
 * Step 1: Check Admin Flag
 *   - It checks whether req.user['admin'] is true.
 *   - If the user has admin rights, it calls next() to continue
 *     to the next middleware or route handler.
 *
 * Step 2: Handle Insufficient Privileges
 *   - If the user is not an admin, it returns HTTP 401 with an error message
 *     indicating "insufficient authorities".
 *
 * Request:
 *   req.user must exist and contain an "admin" field (boolean).
 *
 * Response:
 *   401: If the user does not have admin privileges.
 *   Next middleware is called if the user is an admin.
 */
async function adminValidator(req, resp, next){
    if(req.user['admin']){
       next()
    }else{
       return resp.status(401).json(fail(5, "insufficiant authorities", null))
    }
}

module.exports = {authValidator, adminValidator}