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
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/usersRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const compression = require('compression');


const app = express();

// Trust proxy when running behind Heroku (needed for secure cookies)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 🎯 CORS Configuration - MUITO IMPORTANTE!
// Support a comma-separated FRONTEND_URL env value and also accept localhost/127.0.0.1 variations
const defaultAllowed = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

let allowedOrigins = defaultAllowed;
if (process.env.FRONTEND_URL) {
  const raw = process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);
  // add equivalents for localhost <-> 127.0.0.1
  const expanded = new Set();
  raw.forEach((u) => {
    expanded.add(u);
    if (u.includes('localhost')) expanded.add(u.replace('localhost', '127.0.0.1'));
    if (u.includes('127.0.0.1')) expanded.add(u.replace('127.0.0.1', 'localhost'));
  });
  allowedOrigins = Array.from(expanded);
}

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser (postman, curl) requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // IMPORTANTE: Permite headers customizados para imagens
  exposedHeaders: ['Content-Type', 'Content-Length'],
};

// Apply CORS middleware - SÓ UMA VEZ!
app.use(cors(corsOptions));

// NOTE: static frontend serving is handled once, after API routes below.
// The previous implementation had multiple, duplicated handlers and an
// unconditional catch-all that caused incorrect behavior when the
// `frontend/dist` directory didn't exist or was in a different path.

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(compression());

// Webhook endpoint deve estar ANTES do body parser, senão o Stripe não consegue verificar a assinatura
app.post('/api/v1/bookings/webhook-checkout', 
  express.raw({type: 'application/json'}), 
  require('./controllers/bookingController').webhookCheckout
);


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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
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
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against crossSitescripting attacks XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Serve frontend build if present inside the container or sibling folder.
const possibleDistPaths = [
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, '../frontend/dist'),
];
let builtFrontendPath = possibleDistPaths.find((p) => fs.existsSync(p));
if (builtFrontendPath) {
  app.use(express.static(builtFrontendPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(builtFrontendPath, 'index.html'));
  });
}

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
