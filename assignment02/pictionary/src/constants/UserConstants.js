const ACTIVATED = 1
const BANNED = 2
const DELETED = 3

class UserStatus{
    static isActivated(user){
        console.log(user)
        return user.status === ACTIVATED
    }

    static activate(user){
        return user.status = ACTIVATED
    }

    static ban(user){
        user.status = BANNED
    }

    static delete(user){
        user.status = DELETED
    }
}

module.exports = UserStatus