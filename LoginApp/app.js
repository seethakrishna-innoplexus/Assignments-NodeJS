var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator=require('express-validator');
var flash=require('connect-flash');
var session=require('express-session');
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var mongo=require('mongodb');
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/test_db');
var db=mongoose.connection;

var routes=require('./routes/index');
var users=require('./routes/users');
var err=require('./routes/log_err');

//Initializing app
var app = express();

//setting view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//express-session middleware
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

//connect flash middleware
app.use(flash());

//global vars
app.use(function(req, res, next) {
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  next();
});

app.use('/',routes);
app.use('/users',users);
app.use('/log_err',err);

module.exports=app;
