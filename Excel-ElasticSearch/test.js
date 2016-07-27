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

function saveData(document) {
    return elasticClient.index({
        index:indexName,
        type:"exceldocument",
        body:{
            Occupation:document.Occupation,
            Employment:document.Employment,
            Median_Hourly:document.Median_Hourly,
            Mean_Hourly:document.Mean_Hourly,
            Mean_Annual:document.Mean_Annual
        }
    });
}

function Mapping() {
    return elasticClient.indices.putMapping({
        index: indexName,
        type:"exceldocument",
        body:{
            properties: {
            Occupation:{type:"string"},
            Employment:{type:"float"},
            Median_Hourly:{type:"float"},
            Mean_Hourly:{type:"float"},
            Mean_Annual:{type:"float"}
            }
        }
    });
}


var arr=[["apple",200,300,100,200],["pineapple",2000,3000,1000,2000]];

function store(array){
    initIndex().then(function(){
        Mapping().then(function () {
    var promises = array.map(function (data) {
        return saveData({
            Occupation:data[0],
            Employment:data[1],
            Median_Hourly:data[2],
            Mean_Hourly:data[3],
            Mean_Annual:data[4]
        });
    });
    return Promise.all(promises);
    });
});

}

store(arr);
