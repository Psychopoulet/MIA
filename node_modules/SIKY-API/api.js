
// dépendances
	
	var
		CST_DEP_HTTP = require('http'),
		CST_DEP_Q = require('Q');
		
// modules
	
	module.exports = function () {

		// attributes

			var
				m_clTHAT = this,
				m_sCookieSession = '',
				m_bDebugMode = false;

		// methodes
			
			// protected

				function _HTTPRequest(p_sUrl, p_sMethod, p_tabData) {

					var deferred = CST_DEP_Q.defer(), sPOSTData = '', stOptions = {};
						
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
									protocol: 'http:',
									hostname: 'www.siky.fr',
									port: '80',
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
								
								CST_DEP_HTTP.request(stOptions, function(response) {

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
										deferred.reject('error on [' + p_sMethod + '] http://siky.fr/fr/api' + p_sUrl + ' : status code = ' + sStatusCode);
									}
									
								})
								.on('error', function(e) {
									if (e.message) { deferred.reject(e.message); }
									else { deferred.reject(e); }
								})
								.end(sPOSTData);
								
							}
							catch(e) {
								if (e.message) { deferred.reject(e.message); }
								else { deferred.reject(e); }
							}
							
						}
						
					return deferred.promise;

				}

				function _errlog(p_sMessage) {
				
					if (m_bDebugMode) {
						
						console.log('rejected request on http://siky.fr' + sUrl + ' [' +  p_sMethod + ']');
						
						if (p_stData) {
							console.log(p_stData);
						}
						
						console.log(p_sMessage);
						
					}
					
				}

			// public

				this.query = function (p_sApplicationUrl, p_sUrl, p_sMethod, p_stData) {
				
					var deferred = CST_DEP_Q.defer(), sUrl = '/fr/' + p_sApplicationUrl + '/api/' + p_sUrl;
						
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

								if (e.message) {
									deferred.reject(e.message);
									_errlog(e.message);
								}
								else {
									deferred.reject(e);
									_errlog(e);
								}
								
							});
							
					return deferred.promise;
					
				};

				this.login = function (p_sEmail, p_sPassword) {
					
					var deferred = CST_DEP_Q.defer();
						
						m_clTHAT.query('/', '/users/login', 'PUT', { login : p_sEmail, password : p_sPassword })
							.then(function (sResult) {
								deferred.resolve(sResult);
							})
							.catch(function (e) {
								deferred.reject(e);
							});
							
					return deferred.promise;
					
				};
			
				this.getToken = function () {
					return m_sCookieSession;
				};
				
				this.setDebugMode = function (p_bDebugMode) {
					m_bDebugMode = p_bDebugMode;
					return m_clTHAT;
				};
			
	};
