let express = require('express');
let router = express.Router();
const fileSystem = require('fs');
let randomLongitude = require('random-longitude');
let randomLatitude = require('random-latitude');
const config = './config.json';
let generatorValues;

router.get('/sample-endpoint', function(req, res, next) {
  const data = require('../soapui/sample.json');
  res.json(data);
});

router.get('/generate-random-coords', function(req, res) {
  let longitudes = new Array();
  let latitudes = new Array();
  try {
    const loadedConfig = JSON.parse(fileSystem.readFileSync(config));
    generatorValues = loadedConfig.mapSettings.generatorValues;
  } catch (err) {
      response.render('error', {
          error: {
              message: err
          }
      });
  }
  console.log(generatorValues);
  let jsonResponse = {
    "success": true,
    result: {
      "include_total": true,
      fields: [
        {
          "type": "int",
          "id": "ID"
        },
        {
          "type": "numeric",
          "id": "Latitude"
        },
        {
          "type": "numeric",
          "id": "Longitude"
        }
      ],
      "records_format": "objects",
      records: []
    }
  };
  let customFieldKey = generatorValues.customField.name;
  let customFieldValue;
  for(let i = 0; i < generatorValues.numberOfCoords; i++) {
    let response = {
      "ID": i,
      "Latitude": randomLatitude({min: parseFloat(generatorValues.minLatitude), max: parseFloat(generatorValues.maxLatitude)}),
      "Longitude": randomLongitude({min: parseFloat(generatorValues.minLongitude), max: parseFloat(generatorValues.maxLongitude)})
    };
    if(generatorValues.customField.name != null && generatorValues.customField.min != null && generatorValues.customField.max != null) {
      customFieldValue = Math.floor(Math.random() * generatorValues.customField.max + generatorValues.customField.min);
      response = {
        ...response,
        [customFieldKey]: customFieldValue
      }
    }
    jsonResponse.result.records.push(response);
  }
  if(generatorValues.customField.name != null && generatorValues.customField.min != null && generatorValues.customField.max != null){
    jsonResponse.result.fields.push({
      "type": "int",
      "id": customFieldKey
    });
  }
  res.json(jsonResponse);
})

module.exports = router;
