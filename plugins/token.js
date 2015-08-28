
// dépendances
	
	var
		CST_DEP_Path = require('path'),
		CST_DEP_Log = require('logs');

// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket) {
		
		// attributes
			
			var
				m_clLog = new CST_DEP_Log(CST_DEP_Path.join(__dirname, '..', 'logs', 'plugins', 'token'));
				
		// constructor
			
			p_clChildSocket.onConnection(function(socket) {

				socket.removeAllListeners('token_get');
				socket.removeAllListeners('token_empty');
				socket.removeAllListeners('token_error');

				socket
					.on('token_get', function (token) {
						console.log(token);
						socket.MIA.token = token;
						socket.emit('w3', { order : 'play_actioncode', race : 'random', character : 'random', action : 'ready', actioncode : 'random' });
					})
					.on('token_empty', function () {
						
						var sAlpha = 'abcdefghijklmnopqrstuvwxyz0123456789', sToken = '';
						
						for (var i = 0; i < 10; ++i) {
							var al = Math.floor(Math.random() * sAlpha.length);
								al = (al < 0) ? 0 : (al >= sAlpha.length) ? sAlpha.length - 1 : al;
							sToken += sAlpha.substring(al, al+1);
						}
						
						socket.emit('token_set', sToken);
						
					})
					.on('token_error', function (err) {
						m_clLog.err(err);
					});
					
				socket.emit('token_get');
				
			});
			
	};
