const { Environment } = require("./Environment")

class LoxCallable {
    //call(interpreter, args) {}
    arity() { return this.arity }
}

class LoxFunction extends LoxCallable {
    constructor(declaration, closure) {
        super()
         this.declaration = declaration
         this.closure = closure
    }

    call(interpreter, args) {
        let environment = new Environment(this.closure)

        for (let i = 0; i < this.declaration.parameters.length; i++) {
            //TODO: params or paramters?
            environment.define(this.declaration.parameters[i].lexeme,
                args[i])
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment)
        } catch (returnValue) {
            return returnValue.value
        }
        return null
    }

    arity() {
        return this.declaration.parameters.length
    }

    toString() {
        return `<fn ${this.declaration.name.lexeme}>`
    }

}

class NativeFunction extends LoxCallable {
    constructor(arity, funct) {
        super(arity, funct) 
        this.arity = arity
        this.funct = funct    
    }

    call(interpreter, args) {
        return this.funct.apply(null, args)
    }

    toString() {
        return "<native fn>"
    }
}

module.exports = {LoxCallable, NativeFunction, LoxFunction}