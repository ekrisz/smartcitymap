let Promise = require('promise');
let axios = require('axios');
const config = './config.json';
const fileSystem = require('fs');
const median = require('median');

const dataGet = () => {
  return new Promise(async function (resolve, reject) {
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
    let params = (mapSettings.url.indexOf("?") >= 0 ? "" : "?") + (data.limit ? "&limit=" + data.limit : "") + (data.q ? "&q=" + data.q : "");
    await axios.get(mapSettings.url + params)
      .then(function (response) {
        let records = response.data.result.records;
        let points = new Array();
        let latitudes = new Array();
        let longitudes = new Array();
        records.forEach(element => {
          let desc = '"';
          if ((element.Latitude != 0 || element.LATITUDE != 0) && (element.Longitude != 0 || element.LONGITUDE != 0)) {
            mapSettings.selectedFields.map((field) => {
              desc += `<p>` + field + `: ` + element[field] + `</p>`
            })
            desc += '"';
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
        console.log(mapSettings.url + params);
        resolve(result);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
}

const getAll = () => {
  return new Promise(async function (resolve, reject) {
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
    let params = (mapSettings.url.indexOf("?") >= 0 ? "" : "?") + (data.limit ? "&limit=" + data.limit : "") + (data.q ? "&q=" + data.q : "");
    await axios.get(mapSettings.url + params)
      .then(function (response) {
        console.log(mapSettings.url + params);
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

module.exports = { dataGet, getAll }
