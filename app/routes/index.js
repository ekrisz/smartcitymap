let express = require('express');
let router = express.Router();
let controller = require('../controller/controller');

router.get('/', function (req, res) {
    res.redirect('/map');
});

router.get('/map', function (req, res) {
    controller.dataGet()
        .then(
            function (val) {
                res.render('map', {
                    title: "SmartCityMap",
                    items: val,
                    arraySize: val.points.length,
                    authenticated: req.session.authenticated
                });
            },
            function (error) {
                if (error === null) {
                    res.redirect('/admin');
                } else {
                    res.render('error', {
                        "error": error
                    });
                }
            }
        );
});

module.exports = router;