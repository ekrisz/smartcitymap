var express = require('express');
var router = express.Router();
const fs = require('fs');
const config = './config.json';
var bcrypt = require('bcrypt');
var ping = require('ping');
let loginData;
let mapSettings;

router.get('/', function(req, res) {
    try{
        if(fs.existsSync(config)) {
            if(req.session.authenticated) {
                res.render('admin/admin', {
                    authenticated: req.session.authenticated,
                    data: {
                        url: mapSettings.url,
                        resourceID: mapSettings.resourceID
                    }
                });
            } else {
                res.render('admin/login', {
                    authenticated: req.session.authenticated
                });
            }
        } else {
          res.render('admin/firstrun');
        }
    } catch(err) {
        response.render('error', {
            error: {
                message: err
            }
        });
    }
    
    
})

router.post('/firstrun', async function(req, res) {
    var cfgData = {
        loginData: {
            username: null,
            password: null
        },
        mapSettings: {
            url: 'https://data.smartdublin.ie/api/3/action/datastore_search',
            resourceID: '564f9486-26b1-4e54-8328-bb1113566c86',
            limit: null,
            query: null
        }
    };
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(req.body.password, salt);
    cfgData.loginData = {
        username: req.body.username,
        password: encryptedPassword
    };
    try{
        fs.writeFileSync(config, JSON.stringify(cfgData, null, 4));
        res.redirect('/admin');
    } catch(err) {
        response.render('error', {
            error: {
                message: err
            }
        });
    }
    


})

router.post('/auth', async function(request, response) {
    try{
        const loadedConfig = JSON.parse(fs.readFileSync(config));
        loginData = loadedConfig.loginData;
        mapSettings = loadedConfig.mapSettings;
    } catch(err) {
        response.send(err.message);
    }
	if (loginData && loginData.username === request.body.username) {
        const validPassword = await bcrypt.compare(request.body.password, loginData.password);
        if(validPassword) {
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

router.get('/logout', function(req, res) {
    req.session.authenticated = false;
    res.redirect('/map');
})

router.post('/save', async function (req, res) {
    const url = req.body.url
    const hostname = new URL(url).hostname;

    let isPingOK = await (await ping.promise.probe(hostname)).alive;

    if(isPingOK) {
        mapSettings.url = url;
        mapSettings.resourceID = req.body.resourceID;
        let cfgData = {
            loginData,
            mapSettings
        }
        try{
            fs.writeFileSync(config, JSON.stringify(cfgData, null, 4));
            res.redirect('/admin');
        } catch(err) {
            res.render('error', {
                error: {
                    message: "Ping test OK, but an error occured during saving the config file. Please try again. Error message: " + err
                }
            });
        }
    } else {
        res.render('error', {
            error: {
                message: "Ping test error because URL may not be valid. Data not saved."
            }
        });
    }
});

module.exports = router;