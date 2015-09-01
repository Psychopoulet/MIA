
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Url = require('url'),
		CST_DEP_Q = require('q'),
		CST_DEP_HTTP = require('http'),
		CST_DEP_Log = require('logs');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var
				m_clServer,
				m_sDirWeb = CST_DEP_Path.join(__dirname, '..', 'web'),
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

						var deferred = CST_DEP_Q.defer(), sFileName = '';

							try {

								sFileName = CST_DEP_Path.join(m_sDirWeb, p_sDirectory, p_sFileName);

								if (!CST_DEP_FileStream.existsSync(sFileName)) {
									m_clLog.err('-- [HTTP server] The ' + sFileName + ' file does not exist');
								}
								else {

									CST_DEP_FileStream.readFile(sFileName, 'utf8', function (err, data) {

										if (err) {
											deferred.reject(err);
										}
										else {
											deferred.resolve(data);
										}

									});

								}
								
							}
							catch (e) {
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}
							
						return deferred.promise;
						
					}
					
					function _readAllFiles(p_sDirectory) {

						var deferred = CST_DEP_Q.defer();

							try {

								CST_DEP_FileStream.readdir(p_sDirectory, function (err, files) {

									var bResult = true, sResult = '';

									if (err) {
										deferred.reject(err);
									}
									else {

										files.forEach(function (p_sFile) {
											sResult += CST_DEP_FileStream.readFileSync(CST_DEP_Path.join(p_sDirectory, p_sFile), 'utf8');
										});

										if (bResult) {
											deferred.resolve(sResult);
										}
										else {
											deferred.reject(sResult);
										}

									}

								});

							}
							catch (e) {
								if (e.message) {
									deferred.reject(e.message);
								}
								else {
									deferred.reject(e);
								}
							}
							
						return deferred.promise;

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

									_readFile('templates', 'index.tpl')
										.then(function (data) {
											_sendHTMLResponse(p_clResponse, 200, data);
										})
										.catch(function (error) {
											_sendHTMLResponse(p_clResponse, 500, error);
										});

								break;

								default:

									switch (tabURI[0]) {

										case 'js':

											if (tabURI[1] && 'plugins.js' == tabURI[1]) {

												_readAllFiles(CST_DEP_Path.join(m_sDirWeb, 'js', 'plugins'))
													.then(function (data) {
														_sendJSResponse(p_clResponse, 200, data);
													})
													.catch(function (error) {
														_sendJSResponse(p_clResponse, 500, error);
													});

											}
											else {

												_readFile('js', tabURI[1])
													.then(function (data) {
														_sendJSResponse(p_clResponse, 200, data);
													})
													.catch(function (error) {
														_sendJSResponse(p_clResponse, 500, error);
													});

											}

											
										break;

										case 'css':

											_readFile('css', tabURI[1])
												.then(function (data) {
													_sendCSSResponse(p_clResponse, 200, data);
												})
												.catch(function (error) {
													_sendCSSResponse(p_clResponse, 500, error);
												});

										break;

										case 'pictures':

											switch (tabURI[1]) {

												case 'favicon.png':

													_readFile('pictures', 'favicon.png')
														.then(function (data) {
															_sendPNGResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_sendPNGResponse(p_clResponse, 500, error);
														});

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

													_readAllFiles(CST_DEP_Path.join(m_sDirWeb, 'libs', 'bootstrap', 'css'))
														.then(function (data) {
															_sendCSSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_sendCSSResponse(p_clResponse, 500, error);
														});

												break;

												// js
												
												case 'jquery.js':

													_readFile('libs/jquery', 'jquery.min.js')
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_sendJSResponse(p_clResponse, 500, error);
														});

												break;
												case 'socketio.js':

													_readFile('libs/socketio', 'socket.io.js')
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_sendJSResponse(p_clResponse, 500, error);
														});

												break;
												case 'angular.js':

													_readFile('libs/angularjs', 'angular.min.js')
														.then(function (data) {
															_sendJSResponse(p_clResponse, 200, data);
														})
														.catch(function (error) {
															_sendJSResponse(p_clResponse, 500, error);
														});

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
				
				this.start = function (p_nPort) {

					var deferred = CST_DEP_Q.defer();

						try {

							// lancement

								m_clServer = CST_DEP_HTTP.createServer();
								
								m_clServer.listen(p_nPort, function () {
									m_clLog.success('-- [HTTP server] started');
								});
							
							// requete

								m_clServer.on('request', function (p_clRequest, p_clResponse) {
									_router(p_clResponse, CST_DEP_Url.parse(p_clRequest.url).pathname);
								});
						
							deferred.resolve();

						}
						catch (e) {
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};
				
				this.stop = function (p_fCallback) {

					var deferred = CST_DEP_Q.defer();

						try {

							deferred.resolve();
					
						}
						catch (e) {
							if (e.message) {
								deferred.reject(e.message);
							}
							else {
								deferred.reject(e);
							}
						}
						
					return deferred.promise;

				};
				
	};
	