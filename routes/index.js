var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var axios = require('axios');
var controller = require('../controller/controller');


// mongoose.connect('mongodb://localhost:27017/szakdolgozat', { useNewUrlParser: true }, function (error) {
//     if(error) {
//         console.log(error);
//     }
// });

// var Schema = mongoose.Schema;
// var JsonSchema = mongoose.Schema({
//     name: String,
//     type: Schema.Types.Mixed
// });

// var Json = mongoose.model('JString', JsonSchema, 'layercollection');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/mapjson/:name', function (req, res) {
    if(req.params.name) {
        Json.findOne({ name: req.params.name }, {}, function (err, docs) {
            res.json(docs);
        });
    }
});

router.get('/maplayers', function (req, res) {
    Json.find({}, {'name': 1}, function(err, docs) {
        res.json(docs);
    });
});

router.get('/map', function(req, res) {
    controller.dataGet().then(
        function(val) {
            // console.log(val)
            res.render('map_', {
                "items" : val,
                // "popupText": val.desc,
                lat : 53.3334,
                lng : -6.24431
            });
        },
        function(error) {console.log(error)}
    );
    // Json.find({}, {}, function(e, docs) {
    //     
    // });
});


// API ADATLEKÉRÉS
router.get('/getdata', function(req, res) {
    var data = {
        resource_id: '564f9486-26b1-4e54-8328-bb1113566c86', // the resource id
        limit: 5 // get 5 results
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
        res.json(response.data.result.records);
      })
      .catch(function (error) {
        console.log(error);
      });
});

// router.get('/getall', controller.data_get);

router.get('/test', function(req, res) {
    controller.dataGet().then(
        function(val) {
            console.log(val)
            res.render('index', {
                "jmap" : val,
                lat : 40.78854,
                lng : -73.96374
            });
        },
        function(error) {console.log(error)}
    );
    // Json.find({}, {}, function(e, docs) {
    //     
    // });
});


module.exports = router;