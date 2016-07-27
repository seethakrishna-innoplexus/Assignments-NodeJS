var async=require("async");
var fun1=function(callback){
	callback(null,"fun1 result");
}
var fun2=function(callback){
	callback(null,"fun2 result");
}
var fun3=function(callback){
	callback(null,"fun3 result");
}

var funArr=[fun1,fun2,fun3];

async.parallel(funArr,function(err,result){
	if(err) console.log(err);
	console.log(result[1]);
});