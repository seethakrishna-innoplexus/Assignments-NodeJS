var mongoose=require('mongoose');
var hostname='localhost';
var db_name='test_db';
mongoose.connect('mongodb://localhost/test_db');

var Schema=new mongoose.Schema({
  img: { data: Buffer, contentType: String }
  });
var file_model=mongoose.model('file',Schema);

module.exports=file_model;
