var Promise = require('promise');
var axios = require('axios');
const config = './config.json';
const fileSystem = require('fs');
const median = require('median');

const dataGet = () => {
  return new Promise(function (resolve, reject) {
    let mapSettings = null;
    try {
      if (fileSystem.existsSync(config)) {
        mapSettings = JSON.parse(fileSystem.readFileSync(config)).mapSettings;
        if (mapSettings.resourceID === null) {
          reject(null)
        }
      } else {
        reject(null);
      }
    } catch (err) {
      reject(err);
    }
    let data = {
      resource_id: mapSettings.resourceID,
      limit: mapSettings.limit,
      q: mapSettings.query
    };
    let params = "?" + (data.resource_id ? "resource_id=" + data.resource_id : "") + (data.limit ? "&limit=" + data.limit : "") + (data.q ? "&q=" + data.q : "");
    axios.get(mapSettings.url + params)
      .then(function (response) {
        var records = response.data.result.records;
        var points = new Array();
        var latitudes = new Array();
        var longitudes = new Array();
        records.forEach(element => {
          let desc = "'";
          if ((element.Latitude != 0 || element.LATITUDE != 0) && (element.Longitude != 0 || element.LONGITUDE != 0)) {
            (mapSettings.selectedFields).map((field) => {
              desc += `<p>` + field + `: ` + element[field] + `</p>`
            })
            desc += "'";
            if (element.Latitude) {
              points.push({
                coordinate: element.Latitude + ',' + element.Longitude,
                description: desc
              });
              latitudes.push(element.Latitude);
              longitudes.push(element.Longitude);
            } else {
              points.push({
                coordinate: element.LATITUDE + ',' + element.LONGITUDE,
                description: desc
              });
              latitudes.push(element.LATITUDE);
              longitudes.push(element.LONGITUDE);
            }

          }
        });
        let latMed = (isNaN(median(latitudes)) ? latitudes[0] : median(latitudes));
        let lonMed = (isNaN(median(longitudes)) ? longitudes[0] : median(longitudes));
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

const getAll = () => {
  return new Promise(function (resolve, reject) {
    let mapSettings = null;
    try {
      if (fileSystem.existsSync(config)) {
        mapSettings = JSON.parse(fileSystem.readFileSync(config)).mapSettings;
        if (mapSettings.resourceID === null) {
          reject(null)
        }
      } else {
        reject(null);
      }
    } catch (err) {
      reject(err);
    }
    var data = {
      resource_id: mapSettings.resourceID,
      limit: mapSettings.limit,
      q: mapSettings.query
    };
    let params = "?" + (data.resource_id ? "resource_id=" + data.resource_id : "") + (data.limit ? "&limit=" + data.limit : "") + (data.q ? "&q=" + data.q : "");
    axios.get(mapSettings.url + params)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports = { dataGet, getAll }
