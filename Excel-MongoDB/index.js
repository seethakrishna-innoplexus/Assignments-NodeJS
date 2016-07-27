var express=require('express');
var mongoose=require('mongoose');
var mongodb=require('mongodb');
var xlsx=require('jsxlsx_async');
var fs=require('fs');
var async=require('async');

mongoose.connect('mongodb://localhost/test_db');

var keys=[[],[]];



xlsx('Salary.xlsx',function(err,wb){                                   //Reading the excel file


	if (err){
		console.log(err);
	}

	var sheetNames=wb.getSheetNames();                                //getting names of the sheets

	async.forEachOf(sheetNames,function(sheetName,index,cb){          //using async for looping the sheetnames

		storesheet(wb,sheetName,cb);                                  

	},function(err){
		if(err) console.error(err.message);

	});

});


var storesheet=function(wb,sheetName,cb){                           // function storing the sheetdata into mongodb
		
	wb.getSheetByName(sheetName,function(err,sheet){


	if (err){
		console.log(err);
	}
	
	

	for(var j=0;j<sheet.boundry.col+1;j++){                              
			keys[0][j]=sheet.getCell({row:1,col:j}).value;    //extracting values of second row cells for generating keys 
			keys[0][j]=keys[0][j].replace(/ /g,"_");          //replacing the white spaces in the keys with "_"
			keys[1][j]=sheet.getCell({row:2,col:j}).type;     //extracting types of third row cells for generating key types               
			keys[1][j]=capital(keys[1][j]);                   //capitalizing the types
	}
	
	
	var writeBuffer="";

	writeBuffer="var mongoose=require('mongoose');\n\nvar dataSchema= new mongoose.Schema({\n";

	for(var i=0; i<keys[0].length-1;i++){
			writeBuffer = writeBuffer + "\t"+keys[0][i]+":"+keys[1][i]+",\n";          //writing the keys and their types
		}

	writeBuffer=writeBuffer+"\t"+keys[0][keys[0].length-1]+":"+keys[1][keys[0].length-1]+"\n});\n\nvar datamodel=mongoose.model('"+sheet.getCell({row:0,col:0}).value.replace(/ /g,"_")+ "',dataSchema);\n";

	writeBuffer=writeBuffer+"\nvar store=function(arr){\n\tvar newData=new datamodel();\n";  //writing a function to store each row to database

	for(var i=keys[0].length-1; i>=0;i--){

			writeBuffer = writeBuffer + "\tnewData."+keys[0][i]+"=arr["+i+"].value;\n";

		}

	writeBuffer=writeBuffer+"\tnewData.save();\n}\nmodule.exports=store;";


	
	fs.writeFile(''+sheet.getCell({row:0,col:0}).value.replace(/ /g,"_")+'.js',writeBuffer,function(err,res){

		if(err){
			console.error(err);
		}

		var store=require('./'+sheet.getCell({row:0,col:0}).value.replace(/ /g,"_")+'.js');
		for(k=2;k<sheet.boundry.row+1;k++){

			var array=sheet.rows[k].cells;          //array of each row
			store(array);	                        //storing each array as an object in mongodb

		}
			
	});
		
	});

	return cb;                                     //returning the callback

}


function capital(string){

	return string.charAt(0).toUpperCase() + string.slice(1);
}

	