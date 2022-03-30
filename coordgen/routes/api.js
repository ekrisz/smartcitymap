let express = require('express');
let router = express.Router();
const fileSystem = require('fs');
let axios = require('axios');
let randomLongitude = require('random-longitude');
let randomLatitude = require('random-latitude');
const config = './config.json';
let generatorValues;
let configURL;

router.get('/sample-endpoint', function (req, res, next) {
  const data = require('./sample.json');
  res.json(data);
});

router.get('/generate-random-coords', async function (req, res, next) {
  try {
    const loadedConfig = JSON.parse(fileSystem.readFileSync(config));
    configURL = loadedConfig.configURL;
  } catch (err) {
      console.log(err);
  }
  await axios.get(configURL)
    .then((response) => generatorValues = response.data)
    .catch((error) => console.log(error));
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
  for (let i = 0; i < generatorValues.numberOfCoords; i++) {
    let response = {
      "ID": i,
      "Latitude": randomLatitude({ min: parseFloat(generatorValues.minLatitude), max: parseFloat(generatorValues.maxLatitude) }),
      "Longitude": randomLongitude({ min: parseFloat(generatorValues.minLongitude), max: parseFloat(generatorValues.maxLongitude) })
    };
    if (generatorValues.customField.name != "" && generatorValues.customField.min != "" && generatorValues.customField.max != "") {
      customFieldValue = Math.floor(Math.random() * generatorValues.customField.max + generatorValues.customField.min);
      response = {
        ...response,
        [customFieldKey]: customFieldValue
      }
    }
    jsonResponse.result.records.push(response);
  }
  if (generatorValues.customField.name != "" && generatorValues.customField.min != "" && generatorValues.customField.max != "") {
    jsonResponse.result.fields.push({
      "type": "int",
      "id": customFieldKey
    });
  }
  res.json(jsonResponse);
});

module.exports = router;
