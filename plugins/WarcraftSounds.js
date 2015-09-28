
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_FileStream = require('fs'),
		CST_DEP_Log = require('logs'),
		CST_DEP_W3VoicesManager = require('W3VoicesManager');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket, p_clSIKYAPI) {

		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'warcraftsounds')),
				m_clW3VoicesManager = new CST_DEP_W3VoicesManager(),
				m_tabData = [];
				
		// constructor


			p_clHTTPSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('child.warcraftsounds.getall');
				})
				.onConnection(function(socket) {

					socket
						.on('child.warcraftsounds.getall', function () {

							m_clLog.log('child.warcraftsounds.getall');
							socket.emit('child.warcraftsounds.getall', m_tabData);

						});

				});


			p_clChildSocket
				.onDisconnect(function(socket) {
					socket.removeAllListeners('w3.error');
				})
				.onConnection(function(socket) {

					socket
						.on('w3.error', m_clLog.err)
						.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
						
				});


			function _err(err) {

				if(err.message) {
					err = err.message;
				}

				m_clLog.err(err);

				socket.emit('w3.error', err);
			}


			p_clSIKYAPI.query('warcraftsounds', 'races', 'GET')
				.then(function (p_tabRaces) {

					m_tabData = p_tabRaces;

					m_tabData.forEach(function (value, key) {

						console.log('races/' + value.code + '/warnings');

						p_clSIKYAPI.query('warcraftsounds', 'races/' + value.code + '/warnings', 'GET')
							.then(function (p_tabWarnings) {
								m_tabData[key].warnings = p_tabWarnings;
							})
							.catch(_err);
						
					});

				})
				.catch(_err);
				
	};