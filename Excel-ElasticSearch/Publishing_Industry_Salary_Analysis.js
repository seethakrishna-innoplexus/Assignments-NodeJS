var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'info'
});

var indexName="sheet1";

function initIndex() {
	return elasticClient.indices.create({
		index: indexName
	});
}

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

function Mapping() {
	return elasticClient.indices.putMapping({
		index: indexName,
		type:"data",
		body:{
			properties: {
			Occupation:{type:"string"},
			Employment:{type:"long"},
			Median_Hourly:{type:"float"},
			Mean_Hourly:{type:"float"},
			Mean_Annual:{type:"long"}
			}
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
module.exports=storeData;