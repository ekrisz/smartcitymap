var express = require('express');
let controller = require('../controller/controller');
var router = express.Router();
const fileSystem = require('fs');
const config = './config.json';
var bcrypt = require('bcrypt');
let loginData;
let mapSettings;
let fields;
var axios = require('axios');

router.get('/', function (req, res) {
    try {
        if (fileSystem.existsSync(config)) {
            if (req.session.authenticated) {
                if (mapSettings.url == null || req.query.config == 'url') {
                    res.render('admin/admin', {
                        authenticated: req.session.authenticated,
                        mapSettings,
                        step: 0
                    });
                } else {
                    if (req.query.config == 'query') {
                        res.render('admin/admin', {
                            authenticated: req.session.authenticated,
                            mapSettings,
                            step: 2,
                            fields: fields
                        });
                    }
                    controller.getAll().then(function (val) {
                        fields = val.data.result.fields;
                        res.render('admin/admin', {
                            authenticated: req.session.authenticated,
                            mapSettings,
                            step: 1,
                            fields: fields,
                            selectedFields: mapSettings.selectedFields
                        });
                    }, function (error) {
                        res.render('error', {
                            error: {
                                message: error
                            }
                        });
                    });
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
    var cfgData = {
        loginData: {
            username: null,
            password: null
        },
        mapSettings: {
            url: null, //'https://data.smartdublin.ie/api/3/action/datastore_search',
            resourceID: null, //'564f9486-26b1-4e54-8328-bb1113566c86',
            limit: null,
            query: null,
            positionFieldNames: {
                latitude: null,
                longitude: null
            },
            selectedFields: null
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
            mapSettings.selectedFields = req.body.fields
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
    }
});

router.get('/test', async function (req, res) {
    var data = {
        'resource_id': '1a46095a-0c7a-4f5a-8e84-030884e130d8'
    };
    axios.get('http://smartme-data.unime.it/api/action/datastore_search', {
        data: data
    }).then(function (response) {
        res.send(response.data);
    });
});

module.exports = router;