
/**
 *  Business Response Util
 *  
 */

function succeed(body){
    return {
        "code": 0, 
        "body": body
    }
}

function fail(code, message, body){
    return {
        "code": code, 
        "message": message,
        "body": body
    }
}

module.exports = {succeed, fail}