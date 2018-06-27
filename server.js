const express = require('express');
const redis = require('redis');
const fs = require('fs');
const axios = require('axios');
const PORT = process.env.PORT;
const REDIS_PORT = process.env.REDIS_PORT;
const app = express();
const client = redis.createClient(REDIS_PORT);



function cacheMid(req,res,next){
    var api = req.path;
    client.get(api, function(err, data){
        if (data != null) {
            console.log("from Cache");
            res.send(JSON.parse(data));
        } else {
            next();
        }
    })
}

function getAPI(req,res){
   axios.get('http://datasource.kapsarc.org/api/datasets/1.0/search/?rows=500')
    .then(function (response) {
        var api = req.path;
        var dataset = response.data;
        client.setex(api, 50, JSON.stringify(dataset));
        console.log("from API");
        res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

app.get('/getAPI',cacheMid, getAPI);




/*
function getDataset(req,res){
    var obj;    
    fs.readFile('dataset.json',function (err, data) {
        if (err) throw err;
        client.setex(req.originalUrl, 5, data);
        obj = JSON.parse(data); 
        console.log("from API");
        res.send(obj);
    });
}
app.get('/getCacheData', cacheMid, getDataset);
*/





app.listen(PORT, function () {
    console.log('app listening on port', PORT);
});