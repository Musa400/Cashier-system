const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors  = require('cors');

// routes
const usersRouter = require("./routes/users.routes");
const uploadRouter = require("./routes/upload.routes");
const emailRouter = require("./routes/send-email.routes");
const brandingRouter = require("./routes/branding.routes");
const branchRouter = require("./routes/branch.routes");
const currencyRouter = require("./routes/currency.routes");
const loginRouter = require("./routes/login.routes");
const verifyRouter = require("./routes/verify.routes");
const customerRouter = require("./routes/customer.routes");
const findByAccountRouter = require("./routes/findByAccount.routes");
const transactionRouter = require("./routes/transaction.routes");
const balanceRouter = require("./routes/balance.routes");
const cashSummaryRoutes = require("./routes/Cashier.summary.route");
const exchangeRateRoutes = require('./routes/rate.route');
const exchangeRoutes = require('./routes/Exchange');

const app = express();

// اصلاح شوی allowedOrigins (له اخره / پرته)
const allowedOrigins = [
  "https://sami-cashier.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function(origin, callback) {
    // اجازه ورکوي که origin نشته (مثلاً Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Preflight requests handling

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// route middleware
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/send-email", emailRouter);
app.use("/api/branding", brandingRouter);
app.use("/api/branch", branchRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/login", loginRouter);
app.use("/api/verify-token", verifyRouter);
app.use("/api/customers", customerRouter);
app.use("/api/find-by-account", findByAccountRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/cash-summary", cashSummaryRoutes);
app.use('/api/exchange-rate', exchangeRateRoutes);
app.use('/api/exchange', exchangeRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // locals only in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // respond with JSON for API errors (optional)
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
  }

  // render error page for others
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
