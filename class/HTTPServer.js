
// dépendances
	
	var
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Path = require('path'),
		CST_DEP_Url = require('url'),
		CST_DEP_Log = require('logs'),
		CST_DEP_HTTP = require('http');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clServer,
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'httpserver'));
				
		// methodes

			// protected

				// response
					
					function _sendResponse(p_clResponse, p_nCode, p_sContentType, p_sMessage) {
						p_clResponse.writeHead(p_nCode, {'Content-Type': p_sContentType});
						p_clResponse.end(p_sMessage);
					}
						
						function _sendHTMLResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'text/html', p_sMessage);
						}
							
							function _404(p_clResponse) {
								_sendHTMLResponse(p_clResponse, 404, 'Not found');
							}
							
							function _500(p_clResponse) {
								_sendHTMLResponse(p_clResponse, 500, 'Internal error');
							}
						
						function _sendJSResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'application/javascript', p_sMessage);
						}

						function _sendCSSResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'text/css', p_sMessage);
						}

						function _sendPNGResponse(p_clResponse, p_nCode, p_sMessage) {
							_sendResponse(p_clResponse, p_nCode, 'image/png', p_sMessage);
						}

				// files
					
					function _readFile(p_sDirectory, p_sFileName) {

						var sResult = '';

							var sFileName = CST_DEP_Path.join(__dirname, '..', 'web', p_sDirectory, p_sFileName);

							if (!CST_DEP_FileStream.existsSync(sFileName)) {
								m_clLog.err('-- [HTTP server] The ' + sFileName + ' file does not exist');
							}
							else {
								sResult = CST_DEP_FileStream.readFileSync(sFileName);
							}
							
						return sResult;

					}
					
					function _readFiles(p_sDirectory, p_tabFilesNames) {

						var sResult = '';

							p_tabFilesNames.forEach(function (p_sFile) {
								sResult += _readFile(p_sDirectory, p_sFile);
							});

						return sResult;

					}
					
				// routers
					
					function _router(p_clResponse, p_sPathName) {

						var tabURI;

						try {

							tabURI = p_sPathName.split('/').filter(function (sData) {
								return ('' != sData);
							});

							switch (tabURI.length) {

								case 0:
									m_clLog.log('-- [HTTP server] query');
									_sendHTMLResponse(p_clResponse, 200, _readFile('templates', 'index.tpl'));
								break;

								default:

									switch (tabURI[0]) {

										case 'js':
											_sendJSResponse(p_clResponse, 200, _readFile('js', tabURI[1]));
										break;

										case 'css':
											_sendCSSResponse(p_clResponse, 200, _readFile('css', tabURI[1]));
										break;

										case 'pictures':

											switch (tabURI[1]) {

												case 'favicon.png':
													_sendPNGResponse(p_clResponse, 200, _readFile('pictures', 'favicon.png'));
												break;

												default:
													_404(p_clResponse);
												break;

											}

										break;

										case 'libs':

											switch (tabURI[1]) {

												// css

												case 'bootstrap.css':
													_sendCSSResponse(p_clResponse, 200, _readFiles('libs/bootstrap', ['bootstrap.min.css', 'bootstrap-theme.min.css']));
												break;

												// js
												
												case 'jquery.js':
													_sendJSResponse(p_clResponse, 200, _readFile('libs/jquery', 'jquery.min.js'));
												break;
												case 'socketio.js':
													_sendJSResponse(p_clResponse, 200, _readFile('libs/socketio', 'socket.io.js'));
												break;
												case 'angular.js':
													_sendJSResponse(p_clResponse, 200, _readFile('libs/angularjs', 'angular.min.js'));
												break;

												default:
													_404(p_clResponse);
												break;

											}

										break;

										default:
											_404(p_clResponse);
										break;

									}

								break;

							}
							
						}
						catch (e) {
							m_clLog.err(e);
							_500(p_clResponse);
						}


					}

			// public

				this.getServer = function () {
					return m_clServer;
				};
				
				this.start = function (p_nPort, p_fCallback) {

					try {
						
						// lancement

						m_clServer = CST_DEP_HTTP.createServer();
						
						m_clServer.listen(p_nPort, function () {

							m_clLog.success('-- [HTTP server] started');

							if ('function' === typeof p_fCallback) {
								p_fCallback();
							}
							
						});
						
						// requete

						m_clServer.on('request', function (p_clRequest, p_clResponse) {
							_router(p_clResponse, CST_DEP_Url.parse(p_clRequest.url).pathname);
						});
						
					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
				this.stop = function (p_fCallback) {

					try {

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
						
					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	