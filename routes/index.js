var express = require('express');
var router = express.Router();
var controller = require('../controller/controller');

router.get('/', function(req, res) {
    res.redirect('/map');
});


router.get('/map', function(req, res) {
    controller.dataGet()
        .then(
        function(val) {
            console.log(val)
            res.render('map', {
                title: "SmartCityMap",
                "items" : val,
                authenticated: req.session.authenticated
            });
        },
        function(error) {
            if(error === null){
                res.redirect('/admin');
            } else {
                console.log(error);
                res.render('error', {
                    "error": error
                });
            }
        }
        );
});


module.exports = router;