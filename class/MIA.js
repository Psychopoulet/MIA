
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileSystem = require('fs'),
		CST_DEP_Log = require('logs'),
		CST_DEP_SIKY = require('SIKY-API'),
		CST_DEP_HTTPServer = require(CST_DEP_Path.join(__dirname, 'HTTPServer.js')),
		CST_DEP_HTTPSocket = require(CST_DEP_Path.join(__dirname, 'HTTPSocket.js')),
		CST_DEP_ChildSocket = require(CST_DEP_Path.join(__dirname, 'ChildSocket.js'));
		
// module
	
	module.exports = function () {
		
		// attributes
			
			var m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'MIA')),
				m_clHTTPServer = new CST_DEP_HTTPServer(),
				m_clHTTPSocket = new CST_DEP_HTTPSocket(),
				m_clChildSocket = new CST_DEP_ChildSocket();
				
		// methodes

			// public

				this.start = function (p_stConf, p_fCallback) {

					try {

						m_clHTTPServer.start(p_stConf.portweb, function () {
							
							m_clChildSocket.onConnection(function(socket) {
								socket.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
							});

							var sPluginsPath = CST_DEP_Path.join(__dirname, '..', 'plugins');

							CST_DEP_FileSystem.readdirSync(sPluginsPath).forEach(function (file) {
								require(CST_DEP_Path.join(sPluginsPath, file))(m_clHTTPSocket, m_clChildSocket, CST_DEP_SIKY);
							});

							m_clHTTPSocket.start(m_clHTTPServer.getServer(), function () {
								m_clChildSocket.start(p_stConf.portchildren, p_fCallback);
							});

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

						return;
						
						m_clChildSocket.stop(function () {

							m_clHTTPSocket.stop(function () {

								m_clHTTPServer.stop(p_fCallback);

							});

						});

					}
					catch (e) {
						m_clLog.err(e);
					}
					
				};
				
				this.getVersion = function () {
					return '0.0.1'
				};
				
	};
	