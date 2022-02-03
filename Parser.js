const {Expr, Binary, Unary, Literal, Grouping } = require('./Expr')
const { Token } = require('./Token')
const { TokenType } = require('./TokenType')

class Parser {
    constructor(tokens, Lox ) {
        this.tokens = tokens
        this.current = 0
        this.Lox = Lox
    }

    parse() {
        try {
            return this.expression()
        } catch (error) {

            return null
        }
    }

    expression() {
        return this.equality()
    }

    equality() {
        var expr = this.comparison()

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            var operator = this.previous()
            var right = this.comparison()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    comparison() {
        var expr = this.term()

        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)){
            var operator = this.previous()
            var right = this.term()
            expr = new Binary(expr, operator, right)
        }
        return expr
        
    }

    term() {
        var expr = this.factor()
    
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
          var operator = this.previous()
          var right = this.factor();
          expr = new Binary(expr, operator, right)
        }
        return expr
    }

    factor() {
        var expr = this.unary()

        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            var operator = this.previous()
            var right = this.unary()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    unary() {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            var operator = this.previous()
            var right = this.unary()
            return new Unary(operator, right)
          }
      
          return this.primary()
    }

    primary() {
        if (this.match(TokenType.FALSE)) { return new Literal(false)}
        if (this.match(TokenType.TRUE)) { return new Literal(true)}
        if (this.match(TokenType.NIL)) { return new Literal(null)}
        
        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal)
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            var expr = this.expression()
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return new Grouping(expr)
        }
        throw this.error(this.peek(), "Expect expression.")
    }

    match(...types) {
        for ( let type of types){
            if (this.check(type)) {
                this.advance()
                return true
            }
        }
        return false
    }

    consume(type, message) {
        if (this.check(type)) { return this.advance() }

        throw this.error(this.peek(), message)
    }

    check(type) {
        if (this.isAtEnd()) { return false }
        return this.peek().type == type
    }

    advance() {
        if (!this.isAtEnd()) { this.current++ }
        return this.previous()
    }

    isAtEnd() {
        return this.peek() == TokenType.EOF
    }

    peek() {
        return this.tokens[this.current]
    }

    previous() {
        return this.tokens[this.current - 1]
    }

    error(token, message) {
        // might change back
        this.Lox.error(token, message)
        return new ParseError()
    }

    synchronize() {
        this.advance()

        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) { return }

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return
            }
            this.advance()
        }
    }

    //ParseError()
}

class ParseError extends Error {
}

module.exports = {Parser}