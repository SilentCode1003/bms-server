const http = require('http');
const { Server } = require('socket.io');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const morgan = require("morgan");
const logger = require("./logger");
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
var districtRouter = require('./routes/district');
var notificationRouter = require('./routes/notification');
var red_flagsRouter = require('./routes/red_flags');
var mode_of_transportationRouter = require('./routes/mode_of_transportation');
var purposeRouter = require('./routes/purpose');
var reportingRouter = require('./routes/reporting');


const verifyjwt  = require('./repository/middleware/authentication');

const { SetMongo } = require("./repository/middleware/mongodb");

const app = express();
SetMongo(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const fs = require('fs');
const errorViewPath = path.join(__dirname, 'views', 'error.jade');
if (!fs.existsSync(errorViewPath)) {
    fs.writeFileSync(errorViewPath, 'h1= message\npre #{error.stack}');
}

app.use(cors());
app.use(morgan("dev"));
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
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
app.use('/district', districtRouter);
app.use('/notification', notificationRouter);
app.use('/red_flags', red_flagsRouter);
app.use('/mode_of_transportation', mode_of_transportationRouter);
app.use('/purpose', purposeRouter);
app.use('/reporting', reportingRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  const isApiRequest = req.path.startsWith('/api/') || 
                      req.path.startsWith('/liquidation/') ||
                      req.path.startsWith('/cash_request/') ||
                      req.path.startsWith('/route_access/') ||
                      req.path.startsWith('/notification/') ||
                      req.path.startsWith('/red_flags/') ||
                      req.path.startsWith('/mode_of_transportation/') ||
                      req.path.startsWith('/purpose/') ||
                      req.path.startsWith('/reporting/');

  if (isApiRequest) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = http.createServer(app);

const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('cash_request_updated', (data) => {
    try {
      io.emit('cash_request_updated', { ...data, serverTimestamp: new Date().toISOString() });
    } catch (e) { /* no-op */ }
  });

  socket.on('cash_request_created', (data) => {
    try {
      io.emit('cash_request_created', { ...data, serverTimestamp: new Date().toISOString() });
    } catch (e) { /* no-op */ }
  });

  socket.on('cash_request_fetched', (data) => {
    try {
      io.emit('cash_request_fetched', { ...data, serverTimestamp: new Date().toISOString() });
    } catch (e) { /* no-op */ }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('httpServer', server);
app.set('io', io);

module.exports = { app, server, io };
