
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, 'logs')),
				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket();
				
		// methodes
			
			// public
				
				this.start = function (p_fCallback) {

					try {

						m_clHTTPServer.start(function () {

							m_clHTTPSocket.start(m_clHTTPServer.getServer(), function () {

								m_clChildSocket.start(function () {

									if ('function' === typeof p_fCallback) {
										p_fCallback();
									}

								});

							});

						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
				this.stop = function (p_fCallback) {

					try {

						m_clHTTPServer.stop(function () {

							if ('function' === typeof p_fCallback) {
								p_fCallback();
							}

						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
	};
	