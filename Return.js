const { RuntimeError } = require("./RuntimeError");

//TODO: RuntimeException?
class Return extends RuntimeError {
    constructor(value) {
        super(null, null, false, false)
        this.value = value
    }
}