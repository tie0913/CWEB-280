
SUCCESS = 0
/**
 * Response class
 *
 * Represents a standard API response with a status code, message, and body.
 * Includes a helper method to check if the response indicates success.
 */
class Response{
    constructor(code, message, body){
        this.code = code
        this.message = message
        this.body = body
    }

    isSuccess(){
        return this.code === SUCCESS
    }
}

function succeed(body){
    return new Response(0, null, body)
}

function fail(code, message, body){
    return new Response(code, message, body)
}

module.exports = {succeed, fail}