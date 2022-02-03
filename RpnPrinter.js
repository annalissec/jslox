const {Expr, Binary, Grouping, Literal, Unary} = require('./Expr')
const {TokenType} = require('./TokenType')
const { Token } = require('./Token')

class AstPrinter {
    print(expr) {
        return expr.accept(this)
    }

    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }

    visitGroupingExpr(expr) {
        return this.parenthesize("group", expr.expression)
    }

    visitLiteralExpr(expr) {
        if (expr.value == null) { return "nil" }
        return expr.value.toString()
    }

    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.right)
    }

    parenthesize(name, ...exprs) {
        var builder = '('
        builder += name

        exprs.forEach(value => {

            builder += ' '
            builder += value.accept(this)
            
        })

        builder += ')'

        return builder
    }
}

function main(args) {
    var expression = new Binary(
        new Unary(
            new Token(TokenType.MINUS, '-', null, 1),
            new Literal(123)),
        new Token(TokenType.STAR, '*', null, 1),
        new Grouping(
            new Literal(45.67)));

    console.log(new AstPrinter().print(expression));
  }

main()

module.exports = {AstPrinter}