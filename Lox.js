// annalisse chang - jslox 

//process.argv gets the commandline arguments
class Lox {
    constructor(){
        this.hadError = false;
    }
    main(){
        //the splice takes everything important
        //it will include the "node" and "jslox.js" otherwise
        
        const args= process.argv.splice(2);

        if (args.length > 1){
            System.out.println("Usage: jlox [script]");
        }
        else if (args.length == 1){
        //I have no idea if this is what he intends but this will run stuff
            this.runFile(args[0]);
        }
        else{
            this.runPrompt();
        }
    }

    runFile(path){
        var exec = require('child_process').exec;
        exec(path);

        if (this.hadError) { process.exit(65); }

    }

    run(source){
        this.hadError = false;
        const tokens = source.split(" ");
        tokens.forEach(element => console.log(element));
    }

    runPrompt(){
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        var waitForUserInput = function() {
        rl.question("> ", function(input) {
            this.run(input);

            // is this the right place?
            this.hadError = false;
            waitForUserInput();
        });
        }

        waitForUserInput();

    }

    error (line, message) {
        this.report(line, "", message);
    }

    report(line, where, message) {
        console.log("[line " + line + "] Error" + where + ": " + message);
        this.hadError = true;
    }
}

module.exports = {Lox}
