const ACTIVATED = 1
const BANNED = 2
const DELETED = 3
const STATUS = [{
    code:1,
    name:"activated"
}, {
    code:2,
    name:"banned"
}, {
    code:3,
    name:"deleted"
}]
class UserStatus{
    static isActivated(user){
        return user.status === STATUS[0].code
    }

    static activate(user){
        return user.status = STATUS[0].code
    }

    static ban(user){
        user.status = STATUS[1].code
    }

    static delete(user){
        user.status = STATUS[2].code
    }
}

module.exports = {UserStatus, STATUS}