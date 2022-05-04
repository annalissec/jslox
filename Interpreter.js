const { TokenType } = require("./TokenType")
const {RuntimeError} = require('./RuntimeError')
const { Environment } = require("./Environment")
const { LoxCallable, NativeFunction, LoxFunction } = require("./LoxCallable")
const { Return } = require("./Stmt")

class Interpreter {
    constructor(Lox) {
        this.Lox = Lox
        this.globals = new Environment()
        this.environment = this.globals

        this.globals.define("clock", new NativeFunction(0, () => {
            return Date.now() / 1000.0
        }))
    }

    interpret(statements) {
        try {
            statements.forEach(statement => {
                this.execute(statement)
            })
        } catch (error) {
            this.Lox.runtimeError(error)
        }
    }

    visitLiteralExpr(expr) {
        return expr.value
    }

    visitLogicalExpr(expr) {
        var left = this.evaluate(expr.left)

        if (expr.operator.type == TokenType.OR) {
            if (this.isTruthy(left)) {
                return left
            }
        } else {
            if (!this.isTruthy(left)) {
                return left
            }
        }
        return this.evaluate(expr.right)
    }

    visitUnaryExpr(expr) {
        var right = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS: 
                return -(parseFloat(right))
        }
        return null
    }

    visitVariableExpr(expr) {
        return this.environment.get(expr.name)
    }

    checkNumberOperand( operator, operand ) {
        if (typeof(operand) == "number" ) {return}

        throw new RuntimeError (operator, "Operand must be a number.")
    }

    checkNumberOperands(operator, left, right) {
        if ( typeof(left) == "number" && typeof(right) == "number" ) { return }

        throw new RuntimeError(operator, "Operands must be numbers.")
    }

    isTruthy(object) {
        if (object == null) { return false }
        if (object == true || object == false ) { return object }

        return true
    }

    isEqual(a, b) {
        if ( a == null && b == null ) { return true }

        if (a == null ) { return false }

        return a == b
    }

    stringify(object) {
        if ( object == null ) { return "nil" }

        if (typeof(object) == "number" ) {
            var text = String(object)
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length() - 2)
            }
            return text
        }
        return String(object)
    }

    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression)
    }

    evaluate(expr) {
        return expr.accept(this)
    }

    execute (stmt) {
        stmt.accept(this)
    }

    executeBlock(statements, environment) {
        var previous = this.environment

        try {
            this.environment = environment

            statements.forEach(statement => {
                this.execute(statement)
            })
        } finally {
            this.environment = previous
        }
    }

    visitBlockStmt(stmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment))
        return null
    }

    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression)
        return null
    }

    visitFunctionStmt(stmt) { 
        let func = new LoxFunction(stmt, this.environment)
        this.environment.define(stmt.name.lexeme, func)
        return null
    }

    visitIfStmt(stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch)
        }
        else if ( stmt.elseBranch != null) {
            this.execute(stmt.elseBranch)
        }

        return null
    }

    visitPrintStmt(stmt) {
        var value = this.evaluate(stmt.expression) 
        console.log(this.stringify(value))
        return null
    }

    visitReturnStmt(stmt) {
        let value = null
        if (stmt.value != null) {
            value = this.evaluate(stmt.value)
        }

        throw new Return(value)
    }

    visitVarStmt(stmt) {
        var value = null
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer)
        }

        this.environment.define(stmt.name.lexeme, value)
        return null
    }

    visitWhileStmt(stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body)
        }
        return null
    }

    visitAssignExpr(expr) {
        var value = this.evaluate(expr.value)
        this.environment.assign(expr.name, value)
        return value
    }

    visitBinaryExpr(expr) {
        var left = this.evaluate(expr.left)
        var right = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.BANG_EQUAL: { return !this.isEqual(left, right) }
            case TokenType.EQUAL_EQUAL: { return this.isEqual(left, right) }

            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) > parseFloat(right)

              case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) >= parseFloat(right)

              case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) < parseFloat(right)

              case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) <= parseFloat(right)

            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right)
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) - parseFloat(right)
            
            case TokenType.PLUS:
                if ( typeof(left) == "number" && typeof(right) == "number" ) {
                    return parseFloat(left) + parseFloat(right)
                }

                if (typeof(left) == "string" && typeof(right) == "string" ) {
                    return String(left) + String(right)
                }

                throw new RuntimeError(expr.operator,
                    "Operands must be two numbers or two strings.")
            
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) / parseFloat(right)
           
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right)
                return parseFloat(left) * parseFloat(right)
        }

        return null
    }

    visitCallExpr(expr) {
        var callee = this.evaluate(expr.callee)

        //HACK: https://github.com/brandly/lox.js/blob/master/src/Interpreter.js
        const args = expr.args.map(arg => this.evaluate(arg))
        // for (var arg of expr.args) {
        //     args.push(this.evaluate(arg))
        // }

        if (!(callee instanceof LoxCallable)) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.")
        }

        var func = callee

        if (args.length != func.arity()) {
            throw new RuntimeError(expr.paren, "Expected " +
                func.arity() + " arguments but got " +
                args.length + ".")
        }

        return func.call(this, args)
    }

    // helper functions
    isFloat(n){
        return Number(n) === n && n % 1 !== 0;
    }
}

module.exports = {Interpreter}