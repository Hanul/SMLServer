#!/usr/bin/env node

require('uppercase-core');

RUN(() => {
	
	let Program = require('commander');
	let SMLServer = require('./SMLServer.js');
	
	let packageInfo = PARSE_STR(READ_FILE({
		path : __dirname + '/package.json',
		isSync : true
	}).toString());
	
	Program
		.version(packageInfo.version)
		.action(SMLServer);
	
	Program.parse(process.argv);
});

