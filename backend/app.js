const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const compression = require('compression');


const app = express();



// 📸 SERVIR IMAGENS ESTÁTICAS - ANTES DE TUDO!
app.use(
  '/img',
  express.static(path.join(__dirname, 'public/img'), {
    // Headers específicos para imagens
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);

// Set Security http headers (DEPOIS das imagens!)
// Configure Helmet with a restrictive but functional Content Security Policy.
// Allow `connect-src` to the same origin and to the configured API/frontend host
// (useful when the built frontend embeds an absolute API URL). Also allow
// Stripe script and common asset origins used by Vite/third-party libs.
const cspConnectSrc = new Set(["'self'"]);
try {
  if (process.env.VITE_API_BASE_URL) {
    // VITE_API_BASE_URL may include a path like https://app.example.com/api
    const tmp = new URL(process.env.VITE_API_BASE_URL);
    cspConnectSrc.add(tmp.origin);
  }
} catch (e) {
  // ignore parse errors
}


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", 'https://js.stripe.com'],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        connectSrc: Array.from(cspConnectSrc),
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
// Stripe webhook precisa do raw body — excluir dessas rotas
app.use((req, res, next) => {
  if (
    req.originalUrl === '/api/v1/orders/webhook-checkout' ||
    req.originalUrl === '/api/orders/webhook-checkout'
  ) {
    next();
  } else {
    express.json({ limit: '10kb' })(req, res, next);
  }
});
app.use(cookieParser());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against crossSitescripting attacks XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'category',
      'material',
      'stock',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);

// Backward compatibility
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);




app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
