var Promise = require('promise');
var axios = require('axios');
const config = './config.json';
const fs = require('fs');


const dataGet = () => {
  return new Promise(function (resolve, reject) {
    let mapSettings = null;
    try{
      if(fs.existsSync(config)) {
        mapSettings = JSON.parse(fs.readFileSync(config)).mapSettings;
        if(mapSettings.resourceID === null) {
          reject(null)
        }
      } else {
        reject(null);
      }
    } catch(err) {
        reject(err);
    }
    var data = {
        resource_id: mapSettings.resourceID, 
        limit: mapSettings.limit, 
        q: mapSettings.query
      };
    axios.get(mapSettings.url, {
        data: data,
        dataType: 'jsonp'
      })
      .then(function (response) {
        var records = response.data.result.records;
        var points = new Array();
        var latitudes = new Array();
        var longitudes = new Array();
        records.forEach(element => {
          let desc = "'";
          if(element.Latitude!=0 && element.Longitude!=0) {
            (mapSettings.selectedFields).map((field) => {
              desc += `<p>` + field + `: ` + element[field] + `</p>`
            })
            desc += "'";
            points.push({
              coordinate: element.Latitude + ',' + element.Longitude,
              description: desc
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

const getAll = () => {
  return new Promise(function (resolve, reject) {
    let mapSettings = null;
    try{
      if(fs.existsSync(config)) {
        mapSettings = JSON.parse(fs.readFileSync(config)).mapSettings;
        if(mapSettings.resourceID === null) {
          reject(null)
        }
      } else {
        reject(null);
      }
    } catch(err) {
        reject(err);
    }
    var data = {
        resource_id: mapSettings.resourceID, 
        limit: mapSettings.limit, 
        q: mapSettings.query
      };
    axios.get(mapSettings.url, {
        data: data,
        dataType: 'jsonp'
      })
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
} 

module.exports = {dataGet, getAll}
