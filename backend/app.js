const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors  = require('cors');

// require routes files
const usersRouter = require("./routes/users.routes")
const uploadRouter = require("./routes/upload.routes")
const emailRouter = require("./routes/send-email.routes")
const brandingRouter = require("./routes/branding.routes")
const branchRouter = require("./routes/branch.routes")
const currencyRouter = require("./routes/currency.routes")
const loginRouter = require("./routes/login.routes")
const verifyRouter = require("./routes/verify.routes")
const customerRouter = require("./routes/customer.routes")
const findByAccountRounter = require("./routes/findByAccount.routes")
const TransactionRoute = require("./routes/transaction.routes")
const balanceRouter = require("./routes/balance.routes")
const cashSummaryRoutes = require("./routes/Cashier.summary.route");
const exchangeRateRoutes = require('./routes/rate.route');
const exchangeRoutes = require('./routes/Exchange');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',  // React dev server
      'http://localhost:5173',  // Your frontend URL in production
      // Add other allowed origins as needed
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Enable credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600  // Cache preflight request for 10 minutes
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//route level middleware
app.use("/api/users",usersRouter)
app.use("/api/upload",uploadRouter)
app.use("/api/send-email",emailRouter)
app.use("/api/branding",brandingRouter)
app.use("/api/branch",branchRouter)
app.use("/api/currency",currencyRouter)
app.use("/api/login",loginRouter)
app.use("/api/verify-token",verifyRouter)
app.use("/api/customers",customerRouter)
app.use("/api/find-by-account",findByAccountRounter)
app.use("/api/transaction",TransactionRoute)
app.use("/api/balance",balanceRouter)
app.use("/api/cash-summary", cashSummaryRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/exchange', exchangeRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
