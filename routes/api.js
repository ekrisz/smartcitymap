let express = require('express');
let router = express.Router();

router.get('/sample-endpoint', function(req, res, next) {
  const data = require('../soapui/sample.json');
  res.json(data);
});

module.exports = router;
