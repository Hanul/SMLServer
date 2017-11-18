let SML = require('./index.js');

let html = SML.Compile(READ_FILE({
	path : 'example.sml',
	isSync : true
}).toString());

console.log(html);
