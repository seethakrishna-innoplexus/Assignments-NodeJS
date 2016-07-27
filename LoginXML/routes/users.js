var express = require('express');
var router = express.Router();
var User=require('../lib/User');
var passport=require('passport');
var parser=require('xml2json');
var LocalStrategy=require('passport-local').Strategy;
/* GET users listing. */
router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/:username',function(req,res){
  res.type('application/xml');
  User.getUserByUsername(req.params.username,function(err,user){
    if(err) throw err;
    if(user==null){
      res.send("no user found");
    }else{
      //res.send(parser.toXml(JSON.parse(JSON.stringify(user))));
      console.log("{\"user_details\":"+JSON.stringify(user)+"}");
      res.send(parser.toXml(JSON.parse("{\"user_details\":"+JSON.stringify(user)+"}")));
    }
  });
});

router.get('/register', function(req, res) {
  res.render('register');
});


router.post('/register',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var firstname=req.body.firstname;
  var lastname=req.body.lastname;
  //validation
  req.checkBody('username','username is required').notEmpty();
  req.checkBody('password','password is required').notEmpty();
  req.checkBody('firstname','firstname is required').notEmpty();

  var errors=req.validationErrors();

  if(errors){
    res.render('reg_err',{Error:errors.toString()});
  }else{
    console.log("there is no error in registration");

    var newUser=new User({
      username:username,
      password:password,
      firstname:firstname,
      lastname:lastname
    });

    User.createUser(newUser, function(err,User){
      if(err) throw err;

      res.send({"message":"you are successfully registered","your details":User});
    });

    //req.flash('success_msg', 'You are registered and can now login');
    // res.redirect('/users/login');


  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err,user){
      if(err) throw err;
      if(!user){
        return done(null,false, {message:'Unknown User'});
      }
      console.log("known user");
    User.comparePassword(password,user.password, function(err,isMatch){
      if(err) throw err;
      if(isMatch){
        console.log("passwords match");
        return done(null,user);
      }else{
        return done(null,false,{message: 'Invalid Password'})
      }
    });
});
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local'),
  // {successRedirect:'/users'+req.user.username, failureRedirect:'/log_err',failurefLASH:true}),
  function(req,res){
  res.send(req.user);
});


module.exports = router;
