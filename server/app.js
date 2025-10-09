var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

const swaggerDocs = require("./repository/documentation/swagger");
const swaggerUi = require("swagger-ui-express");

var indexRouter = require('./routes/index');
var dashboardRouter = require('./routes/dashboard');
var route_accessRouter = require('./routes/route_access');
var cash_requestRouter = require('./routes/cash_request');
var cash_request_activityRouter = require('./routes/cash_request_activity');
var liquidationRouter = require('./routes/liquidation');
var liquidation_itemRouter = require('./routes/liquidation_item');
var liquidation_activityRouter = require('./routes/liquidation_activity');


const verifyjwt  = require('./repository/middleware/authentication');

const { SetMongo } = require("./repository/middleware/mongodb");

var app = express();
SetMongo(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Create error.jade if it doesn't exist
const fs = require('fs');
const errorViewPath = path.join(__dirname, 'views', 'error.jade');
if (!fs.existsSync(errorViewPath)) {
    fs.writeFileSync(errorViewPath, 'h1= message\npre #{error.stack}');
}
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', indexRouter);
app.use(verifyjwt);
app.use('/dashboard', dashboardRouter);
app.use('/route_access', route_accessRouter);
app.use('/cash_request', cash_requestRouter);
app.use('/cash_request_activity', cash_request_activityRouter);
app.use('/liquidation', liquidationRouter);
app.use('/liquidation_item', liquidation_itemRouter);
app.use('/liquidation_activity', liquidation_activityRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Check if the request is an API request
  const isApiRequest = req.path.startsWith('/api/') || 
                      req.path.startsWith('/liquidation/') ||
                      req.path.startsWith('/cash_request/') ||
                      req.path.startsWith('/route_access/');

  if (isApiRequest) {
    // Return JSON for API errors
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }

  // For non-API requests, render the error page
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
