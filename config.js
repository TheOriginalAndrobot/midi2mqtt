var pkg = require('./package.json');
var config = require('yargs')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('v', 'possible values: "error", "warn", "info", "debug"')
    .describe('t', 'prefix for connected topic')
    .describe('u', 'mqtt broker url. See https://github.com/mqttjs/MQTT.js#connect-using-a-url')
    .describe('i', 'Input MIDI port/device name')
    .describe('h', 'show help')
    .describe('o', 'Output MIDI port/device name')
    .alias({
        'h': 'help',
        'v': 'verbosity',
        't': 'topic',
        'u': 'url',
        'i': 'input-midi-port',
        'o': 'output-midi-port'
    })
    .default({
        'v': 'info',
        't': 'midi',
        'u': 'mqtt://127.0.0.1',
        'i': 'loopMIDI Port 0',
        'o': 'loopMIDI Port 1'
    })
    .version(pkg.name + ' ' + pkg.version + '\n', 'version')
    .help('help')
    .argv;

module.exports = config;