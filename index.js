#!/usr/bin/env node

//
// MIDI to MQTT bridge
//
// Author: Andy Swing
//


var pkg = require('./package.json');
var config = require('./config.js');
var log = require('yalm');
var Mqtt = require('mqtt');
var Midi = require('easymidi');

log.setLevel(config.v);
log.info(pkg.name + ' ' + pkg.version + ' starting');

var mqttConnected;


//
// MQTT
//

log.info('mqtt trying to connect to', config.url);
var mqtt = Mqtt.connect(config.url, {will: {topic: config.topic + '/connected', payload: '0'}});

// Shotcut for publishing to MQTT and logging it
function pubMQTT(topic, payload){
    var fullTopic = config.topic + '/' + topic;
    log.debug('mqtt >', fullTopic, payload);
    mqtt.publish(fullTopic, payload);
}

mqtt.on('connect', function () {
    mqttConnected = true;
    log.info('mqtt connected ' + config.url);
    mqtt.publish(config.topic + '/connected', '1');
    log.info('mqtt subscribe', config.topic + '/+/in/+/+');
    mqtt.subscribe(config.topic + '/+/in/+/+');

});

mqtt.on('close', function () {
    if (mqttConnected) {
        mqttConnected = false;
        log.info('mqtt closed ' + config.url);
    }
});

mqtt.on('error', function (error) {
    log.error('mqtt error ' + error);
});

mqtt.on('message', function (topic, payload) {
    payload = payload.toString();
    log.debug('mqtt <', topic, payload);

    var parts = topic.split('/');
    var channel = parseInt(parts[parts.length-4]);
    var type = parts[parts.length-2].toString();
    var param = parseInt(parts[parts.length-1]);
    var value = parseInt(payload);
    
    log.debug('midi > channel:', channel, 'type:', type, 'parameter:', param, 'value:', value);
    
    switch (type) {
        case 'noteon':
        case 'noteoff':
            var data = Object();
            data['note'] = param;
            data['velocity'] = value;
            data['channel'] = channel;
            midiOut.send(type, data);
            break;
        case 'cc':
            var data = Object();
            data['controller'] = param;
            data['value'] = value;
            data['channel'] = channel;
            midiOut.send(type, data);
            break;
        case 'poly_aftertouch':
            var data = Object();
            data['note'] = param;
            data['velocity'] = value;
            data['channel'] = channel;
            midiOut.send('poly aftertouch', data);
            break;
        default:
            log.error('Unsupported command \'' + type + '\' recieved via MQTT');
            break;
    }

});


//
// Midi connections
//
log.info('Available MIDI inputs: ', Midi.getInputs());
log.info('Available MIDI outputs: ', Midi.getOutputs());

var midiIn = new Midi.Input(config.midiPort);
var midiOut = new Midi.Output(config.midiPort);

midiIn.on('noteoff', function (msg) {
  log.debug('midi < noteoff', msg.note, msg.velocity, msg.channel);
  pubMQTT('' + msg.channel + '/out/noteoff/' + msg.note, msg.velocity.toString());
});

midiIn.on('noteon', function (msg) {
  log.debug('midi < noteon', msg.note, msg.velocity, msg.channel);
  pubMQTT('' + msg.channel + '/out/noteon/' + msg.note, msg.velocity.toString());
});

midiIn.on('poly aftertouch', function (msg) {
  log.debug('midi < poly aftertouch', msg.note, msg.pressure, msg.channel);
  pubMQTT('' + msg.channel + '/out/poly_aftertouch/' + msg.note, msg.pressure.toString());
});

midiIn.on('cc', function (msg) {
  log.debug('midi < cc', msg.controller, msg.value, msg.channel);
  pubMQTT('' + msg.channel + '/out/cc/' + msg.controller, msg.value.toString());
});

midiIn.on('program', function (msg) {
  log.debug('midi < program', msg.number, msg.channel);
});

midiIn.on('channel aftertouch', function (msg) {
  log.debug('midi < channel aftertouch', msg.pressure, msg.channel);
});

midiIn.on('pitch', function (msg) {
  log.debug('midi < pitch', msg.value, msg.channel);
});

midiIn.on('position', function (msg) {
  log.debug('midi < position', msg.value);
});

midiIn.on('select', function (msg) {
  log.debug('midi < select', msg.song);
});

midiIn.on('clock', function () {
  //log.debug('midi < clock');
});

midiIn.on('start', function () {
  log.debug('midi < start');
});

midiIn.on('continue', function () {
  log.debug('midi < continue');
});

midiIn.on('stop', function () {
  log.debug('midi < stop');
});

midiIn.on('reset', function () {
  log.debug('midi < reset');
});


//
// Catch ctrl-c to exit program
//
process.on('SIGINT', function() {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  midiIn.close();
  midiOut.close();
  mqtt.publish(config.topic + '/connected', '0');
  mqtt.end(function() {
    console.log("Exiting...");
    process.exit();
  });
  
});