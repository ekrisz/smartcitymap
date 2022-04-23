let express = require('express');
let controller = require('../controller/controller');
let router = express.Router();
const fileSystem = require('fs');
const config = './config.json';
let bcrypt = require('bcrypt');
let loginData;
let mapSettings;
let fields;

router.get('/', function (req, res) {
    try {
        if (fileSystem.existsSync(config)) {
            if (req.session.authenticated) {
                if (mapSettings.url == null || req.query.config == 'url') {
                    res.render('admin/admin', {
                        authenticated: req.session.authenticated,
                        mapSettings,
                        step: 0,
                        url: req.protocol + "://" + req.get('host') + "/api/generate-random-coords"
                    });
                } else {
                    if (req.query.config == 'query') {
                        if(mapSettings.query == null) mapSettings.query = "";
                        res.render('admin/admin', {
                            authenticated: req.session.authenticated,
                            mapSettings,
                            step: 2,
                            fields: fields
                        });
                    }
                    // after step 0
                    controller.getAll()
                        .then(function (val) {
                            fields = val.data.result.fields;
                            res.render('admin/admin', {
                                authenticated: req.session.authenticated,
                                mapSettings,
                                step: 1,
                                fields: fields,
                                selectedFields: mapSettings.selectedFields
                            });
                        }).catch(function (error) {
                            res.render('admin/admin', {
                                authenticated: req.session.authenticated,
                                mapSettings,
                                step: 0,
                                error: error
                            });
                        });
                    if (req.query.config == 'coordGen') {
                        res.render('admin/admin', {
                            authenticated: req.session.authenticated,
                            mapSettings,
                            coordGen: true,
                            url: req.protocol + "://" + req.get('host') + "/api/generate-random-coords"
                        });
                    }
                }
            } else {
                res.render('admin/login', {
                    authenticated: req.session.authenticated
                });
            }
        } else {
            res.render('admin/firstrun');
        }
    } catch (err) {
        response.render('error', {
            error: {
                message: err
            }
        });
    }
})

router.post('/firstrun', async function (req, res) {
    let cfgData = {
        loginData: {
            username: null,
            password: null
        },
        mapSettings: {
            url: null,
            resourceID: null,
            limit: null,
            query: null,
            positionFieldNames: {
                latitude: null,
                longitude: null
            },
            zoom: 14,
            selectedFields: null,
            generatorValues: {
                numberOfCoords: 20,
                minLatitude: 46.223415,
                maxLatitude: 46.288222,
                minLongitude: 20.132668,
                maxLongitude: 20.189698,
                customField: {
                    name: "",
                    min: "",
                    max: ""
                }
            }
        }
    };
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(req.body.password, salt);
    cfgData.loginData = {
        username: req.body.username,
        password: encryptedPassword
    };
    try {
        fileSystem.writeFileSync(config, JSON.stringify(cfgData, null, 4));
        res.redirect('/admin');
    } catch (err) {
        response.render('error', {
            error: {
                message: err
            }
        });
    }
})

router.post('/auth', async function (request, response) {
    try {
        const loadedConfig = JSON.parse(fileSystem.readFileSync(config));
        loginData = loadedConfig.loginData;
        mapSettings = loadedConfig.mapSettings;
    } catch (err) {
        response.render('error', {
            error: {
                message: err
            }
        });
    }
    if (loginData && loginData.username === request.body.username) {
        const validPassword = await bcrypt.compare(request.body.password, loginData.password);
        if (validPassword) {
            request.session.authenticated = true;
            response.redirect('/admin');
        } else {
            response.render('error', {
                error: {
                    message: "Incorrect password!"
                }
            });
        }
    } else {
        response.render('error', {
            error: {
                message: "Incorrect username!"
            }
        });
    }
});

router.get('/logout', function (req, res) {
    req.session.authenticated = false;
    res.redirect('/map');
})

router.post('/save', function (req, res) {
    if (req.session.authenticated) {
        switch (req.body.step) {
            case "0":
                mapSettings.url = req.body.url;
                mapSettings.resourceID = req.body.resourceID;
                try {
                    let cfgData = {
                        loginData,
                        mapSettings
                    }
                    fileSystem.writeFileSync(config, JSON.stringify(cfgData, null, 4));
                    res.redirect('/admin');

                } catch (err) {
                    res.render('error', {
                        error: {
                            message: err
                        }
                    });
                }
                break;
            case "1":
                const fields = req.body.fields;
                if(typeof(fields) == 'object') {
                    mapSettings.selectedFields = fields;
                } else {
                    mapSettings.selectedFields = [];
                    mapSettings.selectedFields.push(fields);
                }
                mapSettings.zoom = req.body.zoom;
                try {
                    let cfgData = {
                        loginData,
                        mapSettings
                    }
                    fileSystem.writeFileSync(config, JSON.stringify(cfgData, null, 4));
                    res.redirect('/');
                } catch (err) {
                    res.render('error', {
                        error: {
                            message: "An error occured during saving the config file. Please try again. Error message: " + err
                        }
                    });
                }
                break;
            case "2":
                mapSettings.query = (req.body.query === undefined ? "" : req.body.query);
                mapSettings.limit = (req.body.limit === undefined ? "" : req.body.limit);
                try {
                    let cfgData = {
                        loginData,
                        mapSettings
                    }
                    fileSystem.writeFileSync(config, JSON.stringify(cfgData, null, 4));
                    res.redirect('/admin');
                } catch (err) {
                    res.render('error', {
                        error: {
                            message: "An error occured during saving the config file. Please try again. Error message: " + err
                        }
                    });
                }
                break;
            default:
                if (req.body.coordGen == "true") {
                    let customKey = req.body.customKey;
                    let customMinVal = req.body.customMinValue;
                    let customMaxVal = req.body.customMaxValue;
                    mapSettings.generatorValues.numberOfCoords = (req.body.numberOfCoords === undefined ? 1 : req.body.numberOfCoords);
                    mapSettings.generatorValues.minLatitude = (req.body.minLatitude === undefined ? 0 : req.body.minLatitude);
                    mapSettings.generatorValues.maxLatitude = (req.body.maxLatitude === undefined ? 0 : req.body.maxLatitude);
                    mapSettings.generatorValues.minLongitude = (req.body.minLongitude === undefined ? 0 : req.body.minLongitude);
                    mapSettings.generatorValues.maxLongitude = (req.body.maxLongitude === undefined ? 0 : req.body.maxLongitude);
                    mapSettings.generatorValues = {
                        ...mapSettings.generatorValues,
                        customField: {
                            name: customKey,
                            min: customMinVal,
                            max: customMaxVal
                        }
                    }
                    console.log(mapSettings);
                    try {
                        let cfgData = {
                            loginData,
                            mapSettings
                        }
                        fileSystem.writeFileSync(config, JSON.stringify(cfgData, null, 4));
                        res.redirect('/admin');
                    } catch (err) {
                        res.render('error', {
                            error: {
                                message: "An error occured during saving the config file. Please try again. Error message: " + err
                            }
                        });
                    }
                }
        }
    } else {
        res.redirect('/admin');
    }
});

router.get('/uptime', async function (req, res) {
    if (req.session.authenticated) {
        function format(seconds) {
            function pad(s) {
                return (s < 10 ? '0' : '') + s;
            }
            var hours = Math.floor(seconds / (60 * 60));
            var minutes = Math.floor(seconds % (60 * 60) / 60);
            var seconds = Math.floor(seconds % 60);

            return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        }
        res.send("System uptime: " + format(process.uptime()));
    } else {
        res.redirect('/admin');
    }
});

router.get('/exportConfig', function (req, res, next) {
    if (req.session.authenticated) {
        res.set({
            'Location': "/admin"
        });
        const file = `${__dirname}/../config.json`;
        res.download(file);
    } else {
        res.redirect('/admin');
    }
});

router.get('/deleteConfig', function (req, res, next) {
    if (req.session.authenticated) {
        const file = `${__dirname}/../config.json`;
        try {
            req.session.authenticated = false;
            fileSystem.unlinkSync(file);
            res.redirect("/");
        } catch (error) {
            res.render('error', {
                error: {
                    message: "An error occured during deleting the config file. Please try again. Error message: " + err
                }
            });
        }
    } else {
        res.redirect('/admin');
    }
});

module.exports = router;