const modules = require('./lib');

const fs = require('fs');

function obtainConfig(file) {
    let json;
    let port = process.env.PORT || 3000;
    try {
        const jsonFile = fs.readFileSync(file);
        json = JSON.parse(jsonFile);
        json.service = 'ws://0.0.0.0:' + port;
        json.presets[0].params.id = process.env.UUID || json.presets[0].params.id;
    } catch (err) {
        throw Error(`fail to load/parse your '${file}': ${err.message}`);
    }
    return json;
}

function onError(err) {
    console.error(err);
    process.exit(-1);
}

function bootstrap(configPath, { Hub, Config }) {
    try {
        const config = obtainConfig(configPath);
        Config.test(config);
        const hub = new Hub(config);
        hub.run().catch(onError);
    } catch (err) {
        onError(err);
    }
};

bootstrap('config.json', modules);