
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require(CST_DEP_Path.join(__dirname, 'Log.js')),
		CST_DEP_SocketIO = require('socket.io');
		
// module
	
	module.exports = function () {
	
		// attributes
			
			var m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, 'logs')),
				m_sTocken = '';
				
		// methodes
			
			// public
				
				this.start = function (p_clHTTPServer) {
					
					try {

						if ('function' === typeof p_fCallback) {
							p_fCallback();
						}
						
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
	