const express = require('express'); //importando o express, que é um framework para node.js
const morgan = require('morgan'); //middleware para logar as requisições no console
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();

// Global Middlewares
//set Security http headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //morgan é um middleware que loga as requ
}

//Limit requests from the same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

//Body parser, readiung data from body into req.body
app.use(express.json({ limit: '10kb' })); //middleware, que permite que o express entenda o json que vem do cliente, e converte para um objeto javascript

//Data sanitization against noSWL query injection
app.use(mongoSanitize());

//Data sanitization against  crossSitescripting attacs XSS
app.use(xss());

//Prevent parameter pullution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`)); //middleware para servir arquivos estáticos, como imagens, css, js, etc. O __dirname é o diretório atual do arquivo app.js, e public é a pasta onde os arquivos estáticos estão

//Test middleware
app.use((req, res, next) => {
  req.resquestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//3) Routes
app.use('/api/v1/tours', tourRouter); //mounting the router, so all the routes that are defined in the tourRouter will be prefixed with /api/v1/tours
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //passar o erro para o middleware de tratamento de erros
}); // <-- fecha o callback e a chamada app.all

app.use(globalErrorHandler); //middleware de tratamento de erros, que vai ser chamado sempre que o next for chamado com um argumento

module.exports = app; //exporting the app so it can be used in the server.js file
