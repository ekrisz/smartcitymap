var express = require('express');
var Promise = require('promise');
var router = express.Router();
var mongoose = require('mongoose');
var axios = require('axios');

const dataGet = () => {
  return new Promise(function (resolve, reject) {
    var data = {
        resource_id: '564f9486-26b1-4e54-8328-bb1113566c86', // the resource id
        // limit: 5 // get 5 results
        //q: 'jones' // query for 'jones'
      };
    axios.get('https://data.smartdublin.ie/api/3/action/datastore_search', {
        data: data,
        dataType: 'jsonp'
      })
      .then(function (response) {
        //console.log(response.data['result']['records']);
        // res.render('index', { title: 'x', result: JSON.stringify(response.data['result']['records'][0]["Battery"]) });
        // result = response.data['result']['records'];
        // console.log(response.data.result.records);
        var records = response.data.result.records;
        var points = new Array();
        var latitudes = new Array();
        var longitudes = new Array();
        records.forEach(element => {
          if(element.Latitude!=0 && element.Longitude!=0 && element.Battery!=null) { 
            points.push({
              coordinate: element.Latitude + ',' + element.Longitude,
              description: element.Battery
            });
            latitudes.push(element.Latitude);
            longitudes.push(element.Longitude);
          }
        });
        const latMed = median(latitudes);
        const lonMed = median(longitudes);
        const result = {
          "latMed": latMed,
          "lonMed": lonMed,
          "points": points
        }
        resolve(result);
      })
      .catch(function (error) {
        reject(error);
      });
  });
} 

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a-b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid-1] + nums[mid]) /2;
}


router.get('/getdata', function(req, res) {
    
});

module.exports = {dataGet}
