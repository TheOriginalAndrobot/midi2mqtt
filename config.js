var pkg = require('./package.json');
var config = require('yargs')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('v', 'possible values: "error", "warn", "info", "debug"')
    .describe('t', 'prefix for connected topic')
    .describe('u', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
    .describe('p', 'Full MIDI port/device name')
    .describe('h', 'show help')
    .alias({
        'h': 'help',
        'v': 'verbosity',
        't': 'topic',
        'u': 'url',
        'p': 'midi-port'
    })
    .default({
        'v': 'info',
        't': 'midi',
        'u': 'mqtt://127.0.0.1',
        'p': 'Midi Fighter 3D 20:0'
    })
    .version(pkg.name + ' ' + pkg.version + '\n', 'version')
    .help('help')
    .argv;

module.exports = config;