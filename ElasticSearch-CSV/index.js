var ElasticsearchCSV = require('elasticsearch-csv');
 
// create an instance of the importer with options 
var esCSV = new ElasticsearchCSV({
    es: { index: 'apple', type: 'csv_data', host: 'localhost:9200' },
    csv: { filePath: 'Salary.csv', headers: true }
});
 
esCSV.import()
    .then(function (response) {
        console.log(response);
    });