const {TokenType} = require('./TokenType')
const { Token } = require('./Token')

const keywords = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE
}

class Scanner {

    constructor (source, Lox) {
        this.Lox = Lox
        this.source = source
        this.tokens = []
    
        this.start = 0
        this.current = 0
        this.line = 1
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
    
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    isAtEnd () {
        return this.current >= this.source.length
      }
    
    advance () {
        this.current++
        return this.source.charAt(this.current - 1)
    }

    addToken (type, literal = null ) {
        var text = this.source.substring(this.start, this.current)
        text = text.replace(' ', "")

        this.tokens.push(new Token(type, text, literal, this.line))
    }

    scanToken () {

        const c = this.advance()

        switch (c) {
            case '(' : this.addToken(TokenType.LEFT_PAREN); break
            case ')' : this.addToken(TokenType.RIGHT_PAREN); break
            case '{' : this.addToken(TokenType.LEFT_BRACE); break
            case '}' : this.addToken(TokenType.RIGHT_BRACE); break;
            case ',' : this.addToken(TokenType.COMMA); break;
            case '.' : this.addToken(TokenType.DOT); break;
            case '-' : this.addToken(TokenType.MINUS); break;
            case '+' : this.addToken(TokenType.PLUS); break;
            case ';' : this.addToken(TokenType.SEMICOLON); break;
            case '*' : this.addToken(TokenType.STAR); break; 

            case '!' : this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break
            case '=' : this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break
            case '<' : this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break
            case '>' : this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break
//longer lexme
            case '/' :
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance()
                }
                else {
                    this.addToken(TokenType.SLASH)
                }
                break
//whitespace
            case ' ':
            case '\r':
            case '\t':
                break
            
            case '\n':
                this.line++
                break
// string literals
            case '"' : 
                this.string()
                break

            default:
                if (this.isDigit(c)) {
                    this.number()
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    this.Lox.error(this.line, 'Unexpected character.')
                }
                break
        }

    }

    identifier () {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance()
        }

        var text = this.source.substring(this.start, this.current)

        text = text.replace(' ', "")

        var type = text in keywords ? keywords[text] : TokenType.IDENTIFIER

        this.addToken(type)
    }

    number() {
        while (this.isDigit(this.peek())) {
            this.advance()
        }

        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance()
            while (this.isDigit(this.peek())) {
                this.advance()
            }
        }
        this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)))
    }

    string() {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++
            this.advance()
        }

        if (this.isAtEnd()) {
            this.Lox.error(this.line, "Unterminated string.");
            return
        }

        this.advance()

        const value = this.source.substring(this.start + 1, this.current - 1)
        this.addToken(TokenType.STRING, value)
    }

    match(expected) {
        if (this.isAtEnd()) {
            return false
        }
        if (this.source[this.current] !== expected) { return false }
        
        this.current++

        return true
    }

    peek() {
        if (this.isAtEnd()) {return '\0'}
        return this.source.charAt(this.current)
    }

    isDigit (c) {
        return c >= '0' && c <= '9'
    }

    peekNext() {
        if (this.current + 1 >= this.source.length) {
            return '\0'
        }

        return this.source.charAt(this.current + 1)
    }

    isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
    }

    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c)
    }

}
module.exports = {Scanner}