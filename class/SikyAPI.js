
// dépendances
	
	var
		https = require('https'),
		q = require('q');
		
// modules
	
	module.exports = function () {

		"use strict";
		
		// attributes

			var
				that = this,
				m_sCookieSession = '',
				m_bDebugMode = false,
				m_tabOnLogin = [];

		// methodes
			
			// protected

				function _HTTPRequest(p_sUrl, p_sMethod, p_tabData) {

					var deferred = q.defer(), sPOSTData = '', stOptions = {};
						
						p_tabData = (!p_tabData) ? {} : p_tabData;
						p_sMethod = (!p_sMethod) ? 'GET' : p_sMethod;
						
						if (!p_sUrl) {
							deferred.reject('undefined url');
						}
						else {
							
							while (0 < p_sUrl.indexOf('//')) {
								p_sUrl = p_sUrl.replace('//', '/');
							}
							
							try {
								
								if ('GET' === p_sMethod) {
									
									var nI = 0;
									
									for (var sKey in p_tabData) {
										p_sUrl += (0 === nI) ? '?' : '&';
										p_sUrl += sKey + '=' + p_tabData[sKey];
										++nI;
									}
									
								}
								else {
									sPOSTData = JSON.stringify(p_tabData);
								}
								
								stOptions = {
									protocol: 'https:',
									hostname: 'www.siky.fr',
									port: 443,
									path: p_sUrl,
									method: p_sMethod,
									headers: {
										'Content-Type': 'application/x-www-form-urlencoded',
										'Content-Length': sPOSTData.length
									}
								};
								
								if ('' != m_sCookieSession) {
									stOptions.headers.Cookie = m_sCookieSession;
								}
								
								https.request(stOptions, function(response) {

									var sStatusCode = '', sResponse = '';

									if ('' == m_sCookieSession) {
										
										m_sCookieSession = response.headers['set-cookie'][0].split(';');
										m_sCookieSession = m_sCookieSession[0];
										
										if (m_bDebugMode) {
											console.log(m_sCookieSession);
										}
										
									}
									
									response.setEncoding('utf8');
									
									sStatusCode = response.statusCode + '';
									
									if (2 == sStatusCode.charAt(0)) {

										response
											.on('data', function (data) {
												sResponse += data;
											})
									        .on('end', function() {
												deferred.resolve(sResponse);
											});


									}
									else {
										deferred.reject('error on [' + p_sMethod + '] https://siky.fr' + p_sUrl + ' : status code = ' + sStatusCode);
									}
									
								})
								.on('error', function(e) {
									deferred.reject((e.message) ? e.message : e);
								})
								.end(sPOSTData);
								
							}
							catch(e) {
								deferred.reject((e.message) ? e.message : e);
							}
							
						}
						
					return deferred.promise;

				}

				function _errlog(p_sMessage) {
				
					if (m_bDebugMode) {
						
						console.log('rejected request on https://siky.fr' + sUrl + ' [' +  p_sMethod + ']');
						
						if (p_stData) {
							console.log(p_stData);
						}
						
						console.log(p_sMessage);
						
					}
					
				}

			// public

				this.query = function (p_sApplicationUrl, p_sUrl, p_sMethod, p_stData) {

					var deferred = q.defer(), sUrl = '/fr/' + p_sApplicationUrl + '/api/' + p_sUrl;
						
						_HTTPRequest(sUrl, p_sMethod, p_stData)
							.then(function (sResult) {
								
								if (!sResult || 0 >= sResult.length) {
									deferred.reject('there is no return');
									_errlog('there is no return');
								}
								else if ('{' != sResult.charAt(0)) {
									deferred.resolve(sResult);
								}
								else {
									
									var stResult = JSON.parse(sResult);
									
									if ('undefined' === typeof stResult.result) {
										deferred.resolve(stResult);
									}
									else if (stResult.result) {
										
										if ('undefined' === typeof stResult.data) {
											deferred.resolve('');
										}
										else {
											deferred.resolve(stResult.data);
										}
										
									}
									else if (stResult.warning) {
										deferred.reject(stResult.warning);
										_errlog(stResult.warning);
									}
									else if (stResult.error) {
										deferred.reject(stResult.error);
										_errlog(stResult.error);
									}
									else {
										deferred.reject('');
										_errlog('');
									}
									
								}
								
							})
							.catch(function (e) {
								deferred.reject((e.message) ? e.message : e);
								_errlog((e.message) ? e.message : e);
							});
							
					return deferred.promise;
					
				};

				this.login = function (p_sEmail, p_sPassword) {
					
					var deferred = q.defer();
						
						that.query('/', '/users/login', 'PUT', { login : p_sEmail, password : p_sPassword })
							.then(function (sResult) {

								m_tabOnLogin.forEach(function(value) {
									value();
								});

								deferred.resolve(sResult);

							})
							.catch(function (e) {
								deferred.reject((e.message) ? e.message : e);
							});
							
					return deferred.promise;
					
				};
			
				this.getToken = function () {
					return m_sCookieSession;
				};
				
				this.setDebugMode = function (p_bDebugMode) {
					m_bDebugMode = p_bDebugMode;
					return that;
				};
				
				this.onLogin = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnLogin.push(p_fCallback);
					}

					return that;

				};
			
	};
