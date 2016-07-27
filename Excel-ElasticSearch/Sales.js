var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'info'
});

var indexName="sheet2";

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
			Date:data.Date,
			Open:data.Open,
			High:data.High,
			Low:data.Low,
			Close:data.Close
		}
	});
}

function Mapping() {
	return elasticClient.indices.putMapping({
		index: indexName,
		type:"data",
		body:{
			properties: {
			Date:{type:"string"},
			Open:{type:"long"},
			High:{type:"float"},
			Low:{type:"float"},
			Close:{type:"float"}
			}
		}
	});
}

function storeData(arr){
	initIndex().then(function(){
		Mapping().then(function () {
		var promises = arr.map(function (data) {
			return saveData({
				Date:data[0].value,
				Open:data[1].value,
				High:data[2].value,
				Low:data[3].value,
				Close:data[4].value
			});
		});
		return Promise.all(promises);
		});
	});
}
module.exports=storeData;