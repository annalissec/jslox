class Stmt {
    accept (visitor) {}
  }
  
class Block extends Stmt {
    constructor (statements) {
      super()
      this.statements = statements
    }
  
    accept (visitor) {
      return visitor.visitBlockStmt(this)
    }
  }
  
class Expression extends Stmt {
    constructor (expression) {
      super()
      this.expression = expression
    }
  
    accept (visitor) {
      return visitor.visitExpressionStmt(this)
    }
  }
  
class Function extends Stmt {
    constructor (name, parameters, body) {
      super()
      this.name = name
      this.parameters = parameters
      this.body = body
    }
  
    accept (visitor) {
      return visitor.visitFunctionStmt(this)
    }
  }
  
class If extends Stmt {
    constructor (condition, thenBranch, elseBranch) {
      super()
      this.condition = condition
      this.thenBranch = thenBranch
      this.elseBranch = elseBranch
    }
  
    accept (visitor) {
      return visitor.visitIfStmt(this)
    }
  }
  
class Print extends Stmt {
    constructor (expression) {
      super()
      this.expression = expression
    }
  
    accept (visitor) {
      return visitor.visitPrintStmt(this)
    }
  }
  
class Return extends Stmt {
    constructor (keyword, value) {
      super()
      this.keyword = keyword
      this.value = value
    }
  
    accept (visitor) {
      return visitor.visitReturnStmt(this)
    }
  }
  
class Var extends Stmt {
    constructor (name, initializer) {
      super()
      this.name = name
      this.initializer = initializer
    }
  
    accept (visitor) {
      return visitor.visitVarStmt(this)
    }
  }
  
class While extends Stmt {
    constructor (condition, body) {
      super()
      this.condition = condition
      this.body = body
    }
  
    accept (visitor) {
      return visitor.visitWhileStmt(this)
    }
  }
  
module.exports = {
    Block,
    Expression,
    Function,
    If,
    Print,
    Return,
    Var,
    While
  }