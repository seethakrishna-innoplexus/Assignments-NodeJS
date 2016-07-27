var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var parser=require('xml2json');
var mongo=require('mongo');
var mongoose=require('mongoose');
var session=require('express-session');
var passport=require('passport');
var expressValidator=require('express-validator');

mongoose.connect('mongodb://localhost/test_db');
var db=mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var err=require('./routes/log_err');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.raw({type:'*/xml'}));
app.use(bodyParser.json({type:'*/json'}));

app.use(function(req,res,next){

  if(req.headers['content-type']=='application/xml'||req.headers['content-type']=='text/xml'){
    req.body=req.body.toString();
    req.body = '<xml>' + req.body + '</xml>';
    req.body=parser.toJson(req.body,{object:true}).xml;
  }

  next();

});


app.use(session({
  secret:'secret',
  saveUnitialized:true,
  resave:true
}));


//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//express-validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// app.use('/',routes);
app.use('/users',users);
// app.use('/log_err',err);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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


module.exports = app;
