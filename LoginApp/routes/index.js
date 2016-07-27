var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("hello");
  console.log("hi");
  res.render('index');
});

module.exports = router;
