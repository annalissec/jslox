class RuntimeError {
    constructor(token, message){
        this.token = token
        this.message = message
    }
}

module.exports = {RuntimeError}