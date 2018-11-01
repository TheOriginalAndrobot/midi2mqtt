# midi2mqtt

[![License][mit-badge]][mit-url]
[![NPM version](https://badge.fury.io/js/midi2mqtt.svg)](http://badge.fury.io/js/midi2mqtt)
[![Dependency Status](https://img.shields.io/gemnasium/TheOriginalAndrobot/midi2mqtt.svg)](https://gemnasium.com/github.com/TheOriginalAndrobot/midi2mqtt)

This is a simple bridge between a MIDI device and MQTT.

## Getting started

* Prerequisites
    * [Node.js](www.nodejs.org) >= 4.2.6 (including npm). 
    * MIDI device connected and showing up when running e.g. `amidi -l`
	* All pre-requisites from the node-midi package, including the libasound2-dev package if on Linux

* Install:    
`sudo npm install -g midi2mqtt`


* Start:	
`midi2mqtt --help`
	* You will likely need to specify the MIDI port (`-p`)
	* You can also specify the MQTT topic prefix with `-t`, including slashes (e.g. `-t "home/midi"`).

* Example command line:  
`midi2mqtt -t "house/midi" -u "mqtt://mqtt-server" -p "Midi Fighter 3D 20:0"`

## Topics and Payloads

### Updates from MIDI device to MQTT (read-only)

Topics take the form `<topic>/out/<channel>/<type>/<parameter> <value>`
where \<topic\> defaults to 'midi', \<channel\> is the MIDI channel (0-15), \<type\> is one
of 'noteon', 'noteoff', etc., \<parameter\> depends on type, and \<value\> is the message payload
which also depends on type.

`<topic>/out/<channel>/noteon/<note> <velocity>`
`<topic>/out/<channel>/noteoff/<note> <velocity>`
`<topic>/out/<channel>/poly_aftertouch/<note> <pressure>`
`<topic>/out/<channel>/cc/<controller> <value>`


### Commands from MQTT to MIDI device (write-only)

Topics take the form `<topic>/in/<channel>/<type>/<parameter> <value>`
where \<topic\> defaults to 'midi', \<channel\> is the MIDI channel (0-15), \<type\> is one
of 'noteon', 'noteoff', etc., \<parameter\> depends on type, and \<value\> is the message payload
which also depends on type.

`<topic>/in/<channel>/noteon/<note> <velocity>`
`<topic>/in/<channel>/noteoff/<note> <velocity>`
`<topic>/in/<channel>/poly_aftertouch/<note> <pressure>`
`<topic>/in/<channel>/cc/<controller> <value>`


### Special-purpose topics

#### \<topic\>/connected
Read-only status of the program:
* `1` when program is up
* `0` when the program exits or MQTT disconnects


## Starting at boot

You can easily start this program on boot using systemd.  
  
First, as root, create `/usr/lib/systemd/system/midi2mqtt.service` with the following contents:

	[Unit]
	Description=Bridge from MIDI to MQTT
	Wants=network-online.target
	After=network-online.target
	
	[Service]
	Type=simple
	ExecStart=/usr/local/bin/midi2mqtt -t "midi" -u "http://mqtt-server" -p "MIDI Device Name"
	Restart=always
	User=<user>
	Group=<group>
	
	# Give a reasonable amount of time for the server to start up/shut down
	TimeoutSec=300
	
	[Install]
	WantedBy=multi-user.target

**Note:** Be sure to edit the midi2mqtt command line args to match your setup as well as
change the User and Group to what the program should run as.


## License

MIT © [Andy Swing](https://github.com/TheOriginalAndrobot)

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
