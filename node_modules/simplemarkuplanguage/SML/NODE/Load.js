/*
 * .sml 파일을 가져온 뒤 수정사항이 있을 때 까지 저장합니다.
 */
SML.Load = METHOD((m) => {
	
	let cachedFileInfos = {};
	
	return {
		
		run : (path, handlers) => {
			//REQUIRED: path
			//REQUIRED: handlers
			//REQUIRED: handlers.notExists
			//REQUIRED: handlers.error
			//REQUIRED: handlers.success
			
			let notExistsHandler = handlers.notExists;
			let errorHandler = handlers.error;
			let handler = handlers.success;
			
			// check file has been updated.
			GET_FILE_INFO(path, {
				notExists : notExistsHandler,
				success : (fileInfo) => {
					
					let cachedFileInfo = cachedFileInfos[path];
					
					if (cachedFileInfo !== undefined
						&& (
							(fileInfo.lastUpdateTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.lastUpdateTime.getTime())
							|| (fileInfo.createTime !== undefined && cachedFileInfo.lastUpdateTime.getTime() === fileInfo.createTime.getTime())
						)
					) {
						handler(cachedFileInfo.html);
					}
					
					else {
						
						READ_FILE(path, {
							notExists : notExistsHandler,
							error : errorHandler,
							success : (buffer) => {
								
								let html = SML.Compile(buffer.toString());
								
								cachedFileInfos[path] = {
									lastUpdateTime : fileInfo.lastUpdateTime === undefined ? fileInfo.createTime : fileInfo.lastUpdateTime,
									html : html
								};
								
								handler(html);
							}
						});
					}
				}
			});
		}
	};
});