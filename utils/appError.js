class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //chama o construtor da classe pai (Error) com a mensagem de erro
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; //para identificar erros operacionais (erros previstos, como 404) de erros de programação (bugs)

        Error.captureStackTrace(this, this.constructor); //remove o construtor da pilha de chamadas
    }
}
module.exports = AppError; //exporta a classe AppError para ser usada em outros arquivos