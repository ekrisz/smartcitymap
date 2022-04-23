let express = require('express');
let router = express.Router();
const fileSystem = require('fs');
const config = './config.json';
let controller = require('../controller/controller');

router.get('/', function (req, res) {
    res.redirect('/map');
});

router.get('/map', function (req, res) {
    try {
        if (fileSystem.existsSync(config)) {
            const loadedConfig = JSON.parse(fileSystem.readFileSync(config));
            mapSettings = loadedConfig.mapSettings;
            if(mapSettings.selectedFields != null){
                controller.dataGet()
                    .then(
                        function (val) {
                            res.render('map', {
                                title: "SmartCityMap",
                                items: val,
                                arraySize: val.points.length,
                                authenticated: req.session.authenticated,
                                zoom: mapSettings.zoom
                            });
                        },
                        function (error) {
                            if (error === null) {
                                res.redirect('/admin');
                            } else {
                                res.render('error', {
                                    "error": "You may have to configure the application. Go to admin page. Error: " + error
                                });
                            }
                        }
                    );
            } else {
                res.redirect('/admin');
            }
        } else {
            res.redirect('/admin');
        }
    } catch (err) {
        response.render('error', {
            error: {
                message: "You may have to configure the application. Go to admin page. Error: " + err
            }
        });
    }
});

module.exports = router;