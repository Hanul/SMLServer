/*
 * WEB_SERVER를 위한 SML 브릿지
 */
SML.Bridge = METHOD((m) => {
	
	let Path = require('path');

	let responseError = (response, error) => {
		
		response({
			statusCode : 500,
			content : 
				'<!doctype html><html><head><meta charset="UTF-8"><title>' + error + '</title></head><body>' +
				'Error' +
				'</body></html>',
			contentType : 'text/html'
		});
	};
	
	let responseNotFound = (response) => {
		
		response({
			statusCode : 404,
			content : 
				'<!doctype html><html><head><meta charset="UTF-8"><title>Page not found.</title></head><body>' +
				'<p><b>Page not found.</b></p>' +
				'</body></html>',
			contentType : 'text/html'
		});
	};
	
	return {
		
		run : (config) => {
			//REQUIRED: config
			//REQUIRED: config.rootPath
			
			let rootPath = config.rootPath;
			
			return {
				
				notExistsHandler : (resourcePath, requestInfo, response) => {
					responseNotFound(response);
				},
				
				requestListener : (requestInfo, response, setRootPath, next) => {
					
					let uri = requestInfo.uri;
					
					let path;
					let ext;
					
					run = () => {
						
						SML.Load(path, {
							notExists : () => {
								responseNotFound(response);
							},
							error : (e) => {
								responseError(response, e);
							},
							success : (html) => {
								
								response({
									content : html,
									contentType : 'text/html'
								});
							}
						});
					};
					
					NEXT([
					(next) => {
						
						// server root path. (index)
						if (uri === '') {
							
							CHECK_FILE_EXISTS(rootPath + '/index.sml', (isExists) => {
								if (isExists === true) {
									uri = 'index.sml';
								} else {
									uri = 'index.html';
								}
								next();
							});
							
						} else {
							next();
						}
					},
					
					() => {
						return () => {
							
							path = rootPath + '/' + uri;
					
							ext = Path.extname(uri).toLowerCase();
							
							// serve .sml file.
							if (ext === '.sml') {
								run();
							}
							
							else if (ext === '') {
								
								NEXT([
								(next) => {
									
									// serve .sml file.
									CHECK_FILE_EXISTS(path + '.sml', (isExists) => {
										
										if (isExists === true) {
											
											CHECK_IS_FOLDER(path + '.sml', (isFolder) => {
												
												if (isFolder === true) {
													next();
												} else {
													path += '.sml';
													run();
												}
											});
										}
										
										else {
											next();
										}
									});
								},
								
								() => {
									return () => {
										
										// serve static file.
										CHECK_FILE_EXISTS(path, (isExists) => {
											
											if (isExists === true) {
											
												// but when path is folder, run SML.
												CHECK_IS_FOLDER(path, (isFolder) => {
													
													if (isFolder === true) {
														path += '/index.sml';
														run();
													} else {
														next();
													}
												});
											}
											
											else {
												next();
											}
										});
									};
								}]);
							}
							
							else {
								next();
							}
						};
					}]);
					
					return false;
				}
			};
		}
	};
});