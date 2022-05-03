// annalisse chang - jslox 

const { Scanner } = require('./Scanner')
const { TokenType } = require('./TokenType')
const { Parser } = require('./Parser')
const { AstPrinter } = require('./AstPrinter')
const { Interpreter } = require("./Interpreter")

const fs = require('fs')

//process.argv gets the commandline arguments

class Lox {
    constructor(){
        this.hadError = false
        this.hadRuntimeError = false
    }
    main(){
        //the splice takes everything important
        //it will include the "node" and "jslox.js" otherwise
        
        const args= process.argv.splice(2)

        if (args.length > 1){
            console.log("Usage: jlox [script]")
        }
        else if (args.length == 1){
        //I have no idea if this is what he intends but this will run stuff
            this.runFile(args[0])
        }
        else{
            this.runPrompt()
        }
    }

    runFile(path){
        const source = fs.readFileSync(path).toString()
        this.run(source)
    
        if (this.hadError) process.exit(0)
        if (this.hadRuntimeError) process.exit(0)

    }

    run(source){
        this.hadError = false
        const scanner = new Scanner(source, this)
        scanner.scanTokens()
        const tokens =  scanner.tokens

        const parser = new Parser(tokens, this)
        const statements = parser.parse()

        const interpreter = new Interpreter(this)
        
        if (this.hadError) { return }

        interpreter.interpret(statements)
    }

    runPrompt(){
        const readline = require('readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        var self = this

        var waitForUserInput = function() {
        rl.question("> ", function(input) {
            
            self.run(input)

            // is this the right place?
            self.hadError = false
            waitForUserInput()
        })
        }

        waitForUserInput()

    }

    error (line, message) {
        this.report(line, "", message)
    }

    report(line, where, message) {
        console.log("[line " + line + "] Error" + where + ": " + message)
        this.hadError = true
    }

    // in chapter 6 they add a new error function for parser
    error ( token, message) {
        if (token.type == TokenType.EOF) {
            this.report(token.line, " at end", message)
        }
        else {
            this.report(token.line, " at '" + token.lexeme + "'", message)
        }
    }

    runtimeError(error) {
        console.log(error)
        console.log(error.message + "\n[line " + error.token.line + "]")
        this.hadRuntimeError = true
    }
}

module.exports = {Lox}
