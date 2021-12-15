var express = require('express')
var router = express.Router()

router.get('/whoami', (req, res) => {
    res.render('pages/whoami');
});

router.get('/hello', (req, res) => {
    if (req.session.login) {
        res.render('pages/hello');
    } else {
        res.render('pages/login', { path: "./hello" });
    }
})

router.post('/login', function (req, res) {
    if (req.body.password == process.env.PASSWORD) {
        req.session.login = true;
        res.json({ "code": 0 })
    } else {
        res.json({ "code": 1 })
    }
});

router.post("/api/command", function (request, response) {
    if (request.session.login) {
        utils.bash(request.body.command)
            .then(result => response.send({ "name": result }))
            .catch(result => response.send({ "name": result }))
    } else {
        res.send({ "name": "auth fail" });
    }
});

router.post("/api/visitors", function (request, response) {
    var userName = request.body.name;
    var doc = { "name": userName };
    response.send(doc);
});

router.get("/env", (req, res) => {
    if (req.session.login) {
        res.end(`<pre>${JSON.stringify(utils.getEnv(), null, 2)}</pre>`);
    } else {
        res.render('pages/login', { path: "./env" });
    }
});

router.get("/pull", (req, res) => {
    if (req.session.login) {
        utils.bash(`bash pull`)
            .then(result => response.end(result))
            .catch(result => response.end(result));
    } else {
        res.render('pages/login', { path: "./pull" });
    }
})

router.get('/cnt', (req, res) => res.end(utils.aggregate("cnt", true)));
router.get('/status', (req, res) => res.json({ "status": "OK", timestamp: Date.now() }));

router.get('/*', (req, res) => {
    res.render('pages/index', { "pm_id": process.env.pm_id })
});

module.exports = router

const fs = require('fs');
const { exec } = require('child_process');

var utils = {
    bash: (command) => {
        return new Promise((resolve, reject) => {
            var result = '<pre>';
            const ls = exec(command, function (error, stdout, stderr) {
                if (error) {
                    result += 'Error code: \n' + error.code;
                    result += 'Signal received: \n' + error.signal;
                    result += '</pre>';
                    reject(result);
                }
                result += 'Child Process STDOUT: \n' + stdout;
                result += 'Child Process STDERR: \n' + stderr;
                result += '</pre>';
                resolve(result);
            });
            ls.on('exit', function (code) {
                result += 'Child process exited with exit code: ' + code + '\n';
            });
        });
    },
    getEnv: () => {
        var keys = [];
        for (var key in process.env) {
            if (key.indexOf("npm_") < 0) {
                keys.push(key);
            }
        }
        var _env = {}
        keys.sort().forEach(key => {
            _env[key] = process.env[key];
        })
        return _env
    },
    aggregate: (name, isnumber) => {
        try {
            var total = isnumber ? 0 : "";
            for (var i = 0; i < process.env.instances; i++) {
                var value = fs.readFileSync(`pm${i}.${name}`);
                total += (isnumber ? parseInt(value) : value + "\n");
            }
            return (total + "");
        } catch (e) {
            return e.message;
        }
    }
}
