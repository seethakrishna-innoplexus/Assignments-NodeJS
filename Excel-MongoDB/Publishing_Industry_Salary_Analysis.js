var mongoose=require('mongoose');

var dataSchema= new mongoose.Schema({
	Occupation:String,
	Employment:Number,
	Median_Hourly:Number,
	Mean_Hourly:Number,
	Mean_Annual:Number
});

var datamodel=mongoose.model('Publishing_Industry_Salary_Analysis',dataSchema);

var store=function(arr){
	var newData=new datamodel();
	newData.Mean_Annual=arr[4].value;
	newData.Mean_Hourly=arr[3].value;
	newData.Median_Hourly=arr[2].value;
	newData.Employment=arr[1].value;
	newData.Occupation=arr[0].value;
	newData.save();
}
module.exports=store;