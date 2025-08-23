const express = require('express'); //importando o express, que é um framework para node.js
const morgan = require('morgan'); //middleware para logar as requisições no console


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');
const app = express();

//Middlewares

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //morgan é um middleware que loga as requ
}

app.use(express.json()); //middleware, que permite que o express entenda o json que vem do cliente, e converte para um objeto javascript
app.use(express.static(`${__dirname}/public`)); //middleware para servir arquivos estáticos, como imagens, css, js, etc. O __dirname é o diretório atual do arquivo app.js, e public é a pasta onde os arquivos estáticos estão

app.use((req, res, next) => {
  req.resquestTime = new Date().toISOString();
  next();
});

//3) Routes
app.use('/api/v1/tours', tourRouter); //mounting the router, so all the routes that are defined in the tourRouter will be prefixed with /api/v1/tours
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //passar o erro para o middleware de tratamento de erros
}); // <-- fecha o callback e a chamada app.all

app.use(globalErrorHandler); //middleware de tratamento de erros, que vai ser chamado sempre que o next for chamado com um argumento

module.exports = app; //exporting the app so it can be used in the server.js file
