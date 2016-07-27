var express=require('express');
var xlsx=require('jsxlsx_async');

var filepath='Salary.xlsx';
var hostname='localhost:9200';
var logger='info';

var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
    host: hostname,
    log: logger
});

var keys=[[],[]];

//makeIndex creates an index in elasticsearch
function makeIndex(indexName) {
    return elasticClient.indices.create({
        index: indexName
    });
}
//Mapping generates a mapping for the index
function Mapping(indexName,map_body) {
    return elasticClient.indices.putMapping({
        index: indexName,
        type:"data",
        body:{                                           
            properties: map_body               //properties is given a map_body json object
        }
    });
}

//saveData saves the data into the elasticsearch
function saveData(indexName,body_data) {
    return elasticClient.index({
        index:indexName,
        type:"data",                         
        body:body_data                         //body is given a body_data json object
    });
}

xlsx(filepath,function(err,wb){                                   //Reading the excel file


    if (err){
        console.log(err);
    }

    var sheetNames=wb.getSheetNames();                           //getting names of the sheets

       
       for(var loop = 0; loop<sheetNames.length;loop++) {                    //looping for the sheetname
     (function(loop) {                                              //anonymous function
      
      storesheet(wb,sheetNames[loop]);  

     })(loop);
    }                                

    });


var storesheet=function(wb,sheetName){                           // function storing the sheetdata into elasticsearch
        
    wb.getSheetByName(sheetName,function(err,sheet){


    if (err){
        console.log(err);
    }
    
    

    for(var j=0;j<sheet.boundry.col+1;j++){                              
            keys[0][j]=sheet.getCell({row:1,col:j}).value;    //extracting values of second row cells for generating keys 
            keys[0][j]=keys[0][j].replace(/ /g,"_");          //replacing the white spaces in the keys with "_"
            keys[1][j]=sheet.getCell({row:2,col:j}).type;     //extracting types of third row cells for generating key types
            if(keys[1][j]=="number"){                         //checking if the type is number and deciding long or float

                if(sheet.getCell({row:2,col:j}).value%1==0){
                    keys[1][j]="long";
                }else{
                    keys[1][j]="float";
                }        
            }

    }

    //writing a string to generate the json object for Mapping
    var string="{";

    //inserting keys from the cells into the string
    for(var k=0;k<keys[0].length-1;k++){
        string=string+"\""+keys[0][k]+"\":{\"type\":\""+keys[1][k]+"\"},"
    }
    string=string+"\""+keys[0][k]+"\":{\"type\":\""+keys[1][k]+"\"}}";

    //converting the string into json object
    var map_body=JSON.parse(string);

    

        var array=[];
        var jsonArray=[];

        //obtaining an array of json objects for saveData
        for(l=2;l<sheet.boundry.row+1;l++){

            //cell objects of a row
            array=sheet.rows[l].cells;

            //writing a string to generate json object
            var body_str="{";
            //insering keys and corresponding cell values into the string
            for(p=0;p<array.length-1;p++){
                body_str=body_str+"\""+keys[0][p]+"\":\""+array[p].value+"\","
            } 

            body_str=body_str+"\""+keys[0][p]+"\":\""+array[p].value+"\"}";

            //converting the string to json object
            jsonArray[l-2]=JSON.parse(body_str);
            
        }

        //calling the functions and storing the data in elasticsearch
        makeIndex(deCapital(sheetName)).then(Mapping(deCapital(sheetName),map_body)).then(function(){

            var promises=jsonArray.map(function(json){         //map maps each json object from 
                return saveData(deCapital(sheetName),json);    //the json array 
            });

            return Promise.all(promises);
        })
        });
}



function deCapital(string){

    return string.charAt(0).toLowerCase() + string.slice(1);
}
