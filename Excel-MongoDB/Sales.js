var mongoose=require('mongoose');

var dataSchema= new mongoose.Schema({
	Date:String,
	Open:Number,
	High:Number,
	Low:Number,
	Close:Number
});

var datamodel=mongoose.model('Sales',dataSchema);

var store=function(arr){
	var newData=new datamodel();
	newData.Close=arr[4].value;
	newData.Low=arr[3].value;
	newData.High=arr[2].value;
	newData.Open=arr[1].value;
	newData.Date=arr[0].value;
	newData.save();
}
module.exports=store;