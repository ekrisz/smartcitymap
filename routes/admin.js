var express = require('express');
var router = express.Router();
const fs = require('fs');
const config = './config.json';
var bcrypt = require('bcrypt');


var app=express();

router.get('/', function(req, res) {
    try{
        if(fs.existsSync(config)) {
            if(req.session.authenticated) {
                res.redirect('/map');
            } else {
                res.render('admin/login', {
                    authenticated: req.session.authenticated
                });
            }
        } else {
          res.render('admin/firstrun');
        }
    } catch(err) {
        res.send(err.message);
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
        fs.writeFileSync(config, JSON.stringify(cfgData));
        res.redirect('/admin');
    } catch(err) {
        res.send(err.message);
    }
    


})

router.post('/auth', async function(request, response) {
    loginData = null;
    try{
        loginData = JSON.parse(fs.readFileSync(config)).loginData;
    } catch(err) {
        res.send(err.message);
    }
	if (loginData && loginData.username === request.body.username) {
        const validPassword = await bcrypt.compare(request.body.password, loginData.password);
        if(validPassword) {
            request.session.authenticated = true;
            response.redirect('/map');
        } else {
            response.status(401).send('<h1>Incorrect Username and/or Password!</h1><p><button onclick="window.history.back()">Go Back</button></p>');
        }			
        response.end();
	} else {
		response.status(401).send('<h1>Incorrect Username and/or Password!</h1><p><button onclick="window.history.back()">Go Back</button></p>');
		response.end();
	}
});

router.get('/config', function(req, res) {
    try{
      if(fs.existsSync(config)) {
        res.redirect("/");
      } else {
        fs.writeFileSync(config, "");
        res.send("No config file");
      }
    } catch(err) {
      res.send(err.message);
    }
    if(req.session.authenticated) {
        res.send("Authenticated");
    } else {
        req.session.authenticated = true;
        res.send("Not authenticated");
    }
  });

router.get('/logout', function(req, res) {
    req.session.authenticated = false;
    res.redirect('/map');
})

module.exports = router;