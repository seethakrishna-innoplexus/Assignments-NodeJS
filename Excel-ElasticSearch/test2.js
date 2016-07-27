var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'info'
});



var arr=["Occu","salary","rent"];
 var buffer=new Buffer("{\""+arr[0]+"\":\"apple\"}");

// var string=buffer.toString();
// console.log(typeof(string));
var body_data=JSON.parse(buffer);
console.log(body_data);


function initIndex(indexName) {
	return elasticClient.indices.create({
		index: indexName
	});
}

initIndex("green").then(elasticClient.index({
		index:"green",
		type:"data",
		id:"_id1",
		body:body_data
	},function(err,res){
		if(err){
			console.error(err);
		}
	}));




function saveData(data) {
	return elasticClient.index({
		index:indexName,
		type:"data",
		body:{
			Occupation:data.Occupation,
			Employment:data.Employment,
			Median_Hourly:data.Median_Hourly,
			Mean_Hourly:data.Mean_Hourly,
			Mean_Annual:data.Mean_Annual
		}
	});
}

function Mapping(body_data) {
	return elasticClient.indices.putMapping({
		index: indexName,
		type:"data",
		body:body_data
		}
	});
}

function storeData(arr){
	initIndex().then(function(){
		Mapping().then(function () {
		var promises = arr.map(function (data) {
			return saveData({
				Occupation:data[0].value,
				Employment:data[1].value,
				Median_Hourly:data[2].value,
				Mean_Hourly:data[3].value,
				Mean_Annual:data[4].value
			});
		});
		return Promise.all(promises);
		});
	});
}