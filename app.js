var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
require('dotenv').config();

var routes = require('./routes/index');
var app = express();

// Enable CORS
// Get user agent and add to the request
app.use(function (req, res, next) {
  var agent = req.headers['user-agent']
  req.useragent = agent;
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, x-zumo-auth, Content-Length, X-Requested-With, Accept');
  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.sendStatus(200);
  }
  else {
    next();
  }
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

app.use(bodyParser.json({
  type:'*/*',
  limit: '50mb',
  verify: function(req, res, buf) {
      if (req.url.startsWith('/webhooks')){
        req.rawbody = buf;
      }
  }
 })
);

app.use('/', routes);



// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
