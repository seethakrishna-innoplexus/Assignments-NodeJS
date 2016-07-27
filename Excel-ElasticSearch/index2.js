var express=require('express');
var xlsx=require('jsxlsx_async');
var fs=require('fs');

var filepath='Salary.xlsx';
var hostname='localhost:9200';

var keys=[[],[]];



xlsx(filepath,function(err,wb){                                   //Reading the excel file


    if (err){
        console.log(err);
    }

    var sheetNames=wb.getSheetNames();                           //getting names of the sheets

       
       for(var loop = 0; loop<sheetNames.length;loop++) {                    //looping for the sheetname
     (function(loop) {                                              //anonymous function
      
      setTimeout(storesheet(wb,sheetNames[loop],loop),0);                //setTimeout executes storesheet without delay 
     })(loop);
    }      
                           

    });


var storesheet=function(wb,sheetName,loop){                           // function storing the sheetdata into elasticsearch
        
    wb.getSheetByName(sheetName,function(err,sheet){


    if (err){
        console.log(err);
    }
    
    

    for(var j=0;j<sheet.boundry.col+1;j++){                              
            keys[0][j]=sheet.getCell({row:1,col:j}).value;    //extracting values of second row cells for generating keys 
            keys[0][j]=keys[0][j].replace(/ /g,"_");          //replacing the white spaces in the keys with "_"
            keys[1][j]=sheet.getCell({row:2,col:j}).type;     //extracting types of third row cells for generating key types
            if(keys[1][j]=="number"){ 

                if(sheet.getCell({row:2,col:j}).value%1==0){
                    keys[1][j]="long";
                }else{
                    keys[1][j]="float";
                }        
            }

    }
    
    
    var writeBuffer="";


    //writing a file to create a function dynamically, that saves the data into ealsticsearch

    writeBuffer="var elasticsearch = require('elasticsearch');\nvar elasticClient = new elasticsearch.Client({\n\thost: \'"+hostname+"\',\n\tlog: 'info'\n});";

    //taking sheetname as the index
    writeBuffer=writeBuffer+"\n\nvar indexName=\""+deCapital(sheetName)+"\";";

    //function initIndex creates an index in the elasticsearch server
    writeBuffer=writeBuffer+"\n\nfunction initIndex() {\n\treturn elasticClient.indices.create({\n\t\tindex: indexName\n\t});\n}";
    
    //saveData function adds the data as a "data" type to the elastic search
    writeBuffer=writeBuffer+"\n\nfunction saveData(data) {\n\treturn elasticClient.index({\n\t\tindex:indexName,\n\t\ttype:\"data\",\n\t\tbody:{";

    //generating the body of the document using the second row cells of a sheet
    for(var i=0; i<keys[0].length-1;i++){

         writeBuffer = writeBuffer + "\n\t\t\t"+keys[0][i]+":data."+keys[0][i]+",";          
     }

     writeBuffer=writeBuffer+"\n\t\t\t"+keys[0][keys[0].length-1]+":data."+keys[0][keys[0].length-1]+"\n\t\t}\n\t});\n}";

     //Mapping function returns the mapping of the data 
     writeBuffer=writeBuffer+"\n\nfunction Mapping() {\n\treturn elasticClient.indices.putMapping({\n\t\tindex: indexName,\n\t\ttype:\"data\",\n\t\tbody:{\n\t\t\tproperties: {"


     for(var i=0; i<keys[0].length-1;i++){


        writeBuffer = writeBuffer + "\n\t\t\t"+keys[0][i]+":{type:\""+keys[1][i]+"\"},";          
     }

     writeBuffer=writeBuffer+"\n\t\t\t"+keys[0][keys[0].length-1]+":{type:\""+keys[1][keys[0].length-1]+"\"}\n\t\t\t}\n\t\t}\n\t});\n}";

     //function storeData creates an index, maps the given data and saves it in the elasticsearch server
     writeBuffer=writeBuffer+"\n\nfunction storeData(arr){\n\tinitIndex().then(function(){\n\t\tMapping().then(function () {\n\t\tvar promises = arr.map(function (data) {\n\t\t\treturn saveData({";

     for(var i=0; i<keys[0].length-1;i++){

         writeBuffer = writeBuffer + "\n\t\t\t\t"+keys[0][i]+":data["+i+"].value,";          
     }

     writeBuffer=writeBuffer+"\n\t\t\t\t"+keys[0][keys[0].length-1]+":data["+i+"].value\n\t\t\t});\n\t\t});\n\t\treturn Promise.all(promises);\n\t\t});\n\t});\n}";


      writeBuffer=writeBuffer+"\nmodule.exports=storeData;"


    var array=[];

        //array of all the rows
        for(k=2;k<sheet.boundry.row+1;k++){

            array[k-2]=sheet.rows[k].cells; 

        }


    //function writing the buffer into the file
    fs.writeFile(''+sheet.getCell({row:0,col:0}).value.replace(/ /g,"_")+'.js',writeBuffer,function(err,res){

        if(err){
            console.error(err);
        }
    //requiring the created js file
       var storeData=require('./'+sheet.getCell({row:0,col:0}).value.replace(/ /g,"_")+'.js');


        storeData(array);             //storing the data
            
    });
        
    });
}



function capital(string){

    return string.charAt(0).toUpperCase() + string.slice(1);
}

function deCapital(string){

    return string.charAt(0).toLowerCase() + string.slice(1);
}
