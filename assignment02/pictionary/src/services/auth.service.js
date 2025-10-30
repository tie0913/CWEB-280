
const sessionRepository = require('../repositories/session.repo')
const userRepository = require('../repositories/users.repo')
const {withMongoTx} = require('../db/mongo')
const {UserStatus} = require('../constants/UserConstants')
const {succeed, fail} = require('../util/response')

const EXPIRE_TIME_FRAME = 1000 * 60 * 30
class AuthService{

    /**
     * Sign in a user by verifying email and password.
     *
     * Checks user credentials and account status.
     * If valid and activated, creates a new session in a MongoDB transaction
     * (removing any old sessions first) and returns the session ID.
     *
     * Response:
     *   Success: Session ID.
     *   Fail 1: Invalid email or password.
     *   Fail 3: Account not activated; contact administrator.
     */
    async signIn(param){
        const user = await userRepository.getUserByEmail(param.email)
        if(user != null && user.password === param.password){
            if(!UserStatus.isActivated(user)){
                return fail(3, 'user is inactivated please contact Administrator', null)
            }

            const userId = user['_id']
            async function txMethod(tx){
                const expireAt = new Date(new Date().getTime() + EXPIRE_TIME_FRAME)
                const session = {"userId": userId, "expireAt": expireAt}
                await sessionRepository.deleteSessionByUserId(userId, tx)
                return await sessionRepository.insertSession(session, tx)
            }

            const sessionId = await withMongoTx(txMethod)
            return succeed(sessionId);
        }else{
            return fail(1, 'email and password does not match')
        }
    }

    /**
     * 
     * @param sessionId this must be an variable of ObjectId instead of a string
     * @returns 
     */
    async getSession(sessionId){
        return await sessionRepository.getSessionById(sessionId);
    }

    /**
     * 
     * @param userId this is ObjectId
     */
    async signOut(userId){
        await sessionRepository.deleteSessionByUserId(userId)
    }


    async deleteAccount(user){
        async function txMethod(tx){
            await sessionRepository.deleteSessionByUserId(user['_id'], tx)
            await userRepository.deleteUserByUserId(user['_id'], tx)
        }
        await withMongoTx(txMethod)
    }
}

module.exports = new AuthService()