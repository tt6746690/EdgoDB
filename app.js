var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

var conf = require('./config.js');
var app = express();

// mysql connection
var pool  = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'markwang',
  password : '1122',
  database : 'EdgoDB',
  port     : 3306
});
module.exports = pool

// view engine setup
app.set('views', path.join(__dirname, 'views', 'extends'));
app.set('view engine', 'jade');


app.use(favicon(path.join(__dirname, 'dist', 'assets', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));


var routes = require('./routes/index');
var users = require('./routes/users');
var gene = require('./routes/gene')
app.use('/', routes);
app.use('/users', users);
app.use('/gene', gene)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (conf.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(conf.get("express.http.port"), function() {
    console.log('Application listening on %s', conf.get("express.http.port"))
});
