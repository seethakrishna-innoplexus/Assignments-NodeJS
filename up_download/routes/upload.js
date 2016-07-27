var router=express.Router();
var file_model=require('./model');
var fs=require('fs');

router.post('/',function(req,res){
  console.log(req.file);
    upload_data(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
    });

    var file=new file_model();
    file.img.data=fs.readFileSync(req.file.path);
    file.save();
    res.download('./uploads/FL_insurance_sample.csv');

});
module.exports=router;
