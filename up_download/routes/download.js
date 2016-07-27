var router=express.Router();

router.get('/',function(req,res){
    upload_data(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        console.log("file_stored");
    });

    var file=new file_model();
    file.img.data=req.file;
    file.ing.extension=req.file.extension;
    file.save();

    res.send("upload is complete");

});
module.exports=router;
