let PORT = 8119;

let FS = require('fs');
let Path = require('path');
let SML = require('simplemarkuplanguage');
let Less = require('less');

require('http').createServer((req, res) => {

	let url = req.url;
	if (url.indexOf('?') !== -1) {
		url = url.substring(0, url.indexOf('?'));
	}
	if (url === '/') {
		url = '/index.sml';
	}

	let path = './' + url;
	let extname = Path.extname(path);
	let contentType = 'text/html';
	
	if (extname === '.js') {
		contentType = 'application/javascript';
	} else if (extname === '.css') {
		contentType = 'text/css';
	} else if (extname === '.jpg' || extname === '.jpeg') {
		contentType = 'image/jpeg';
	} else if (extname === '.png') {
		contentType = 'image/png';
	} else if (extname === '.sml') {
		contentType = 'text/html';
	} else if (extname === '.less') {
		contentType = 'text/css';
	}
	
	FS.access(path, (error) => {
		
		if (error === null) {
			FS.readFile(path, 'binary', (error, data) => {
				
				if (error === null) {
					
					res.writeHead(200, {
						'Content-Type' : contentType
					});
					
					if (extname === '.sml') {
						let content = SML.Compile(data.toString());
						res.write(content);
						WRITE_FILE({
							path : path.substring(0, path.length - 4) + '.html',
							content : content
						});
					}
					
					else if (extname === '.less') {
						Less.render(content, (error, output) => {
							let content = output.css;
							res.write(content);
							WRITE_FILE({
								path : path.substring(0, path.length - 5) + '.css',
								content : content
							});
						});
					}
					
					else {
						res.write(data, 'binary');
					}
					
					res.end();
				}
				
				else {
					res.writeHead(500, {
						'Content-Type' : 'text/plain'
					});
					res.write(error.toString());
					res.end();
				}
			});
		}
		
		else {
			res.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			res.write('404 Not Found.');
			res.end();
		}
	});
	
}).listen(PORT);

console.log('Started SML Server! http://localhost:' + PORT);
