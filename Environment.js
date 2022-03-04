const { RuntimeError } = require("./RuntimeError")

class Environment {
    constructor(enclosing) {
        this.values = {} 
        this.enclosing = enclosing || null
    }

    get(name) {
        if (name.lexeme in this.values) {
            return this.values[name.lexeme]
        }

        if (this.enclosing != null) {
            return this.enclosing.get(name)
        }

        throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.")
    }

    assign(name, value) {
        if (name.lexeme in this.values) {
            this.values[name.lexeme] = value
            return 
        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value)
            return 
        }

        throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.")
    }

    define(name, value) {
        this.values[name] = value
    }
}

module.exports = {Environment}