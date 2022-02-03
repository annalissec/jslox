// annalisse chang - jslox 

const { Scanner } = require('./Scanner')
const { TokenType } = require('./TokenType')
const { Parser } = require('./Parser')
const { AstPrinter } = require('./AstPrinter')

//process.argv gets the commandline arguments
class Lox {
    constructor(){
        this.hadError = false
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
        var exec = require('child_process').exec
        exec(path)

        if (this.hadError) { process.exit(65) }

    }

    run(source){
        this.hadError = false
        const scanner = new Scanner(source, this)
        scanner.scanTokens()
        const tokens =  scanner.tokens

        const parser = new Parser(tokens, this)
        const expression = parser.parse()

        if (this.hadError) { return }

        console.log(new AstPrinter().print(expression))
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
}

module.exports = {Lox}
