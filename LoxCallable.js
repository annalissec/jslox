class LoxCallable {
    call(interpreter, args) {}
    arity() { return this.arity }
}

class LoxFunction extends LoxCallable {
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

class NativeFunction extends LoxCallable {

}

module.exports = {LoxCallable, NativeFunction, LoxFunction}