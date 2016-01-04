
// dépendances
	
	var
		path = require('path'),
		q = require('q'),
		
		Container = require(path.join(__dirname, 'Container.js')),
		Logs = require(path.join(__dirname, 'Logs.js'));
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'childsocket')),
				m_clSocketServer,
				m_stSocketsConnected = {},
				m_tabOnConnection = [],
				m_tabOnDisconnect = [];
				
		// methodes
			
			// public
				
				this.start = function () {
					
					var deferred = q.defer();

						try {

							m_clSocketServer = require('socket.io').listen(Container.get('conf').get('childrenport'));

							m_clSocketServer.sockets.on('connection', function (socket) {

								socket.MIA = {};

								m_clLog.success('-- [child socket client] ' + socket.id + ' connected');
								
								socket.on('disconnect', function () {
									
									m_clLog.info('-- [child socket client] ' + socket.id + ' disconnected');
									
									socket.removeAllListeners('child.token.get');
									socket.removeAllListeners('child.token.empty');
									socket.removeAllListeners('child.token.error');

									m_tabOnDisconnect.forEach(function (fOnDisconnect) {
										fOnDisconnect(socket);
									});

									delete m_stSocketsConnected[socket.MIA.token];

								});

								socket
									.on('child.token.get', function (sToken) {
										
										socket.MIA.token = sToken;
										socket.MIA.name = sToken;

										m_stSocketsConnected[sToken] = socket;

										m_clLog.success('-- [child socket client] get token \'' + sToken + '\'');

										m_tabOnConnection.forEach(function (fOnConnection) {
											fOnConnection(socket);
										});
										
									})
									.on('child.token.empty', function () {
										
										var sAlpha = 'abcdefghijklmnopqrstuvwxyz0123456789', sToken = '';
										
										for (var i = 0; i < 10; ++i) {
											var al = Math.floor(Math.random() * sAlpha.length);
												al = (al < 0) ? 0 : (al >= sAlpha.length) ? sAlpha.length - 1 : al;
											sToken += sAlpha.substring(al, al+1);
										}
										
										socket.emit('child.token.set', sToken);
										
									})
									.on('child.token.error', function (err) {
										m_clLog.err(err);
									});
									
								socket.emit('child.token.get');
								
							});

							m_clLog.success('-- [child socket server] started on port ' + Container.get('conf').get('childrenport'));
							
							deferred.resolve();

						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};
				
				this.stop = function () {

					var deferred = q.defer();

						try {
							deferred.resolve();
						}
						catch (e) {
							deferred.reject((e.message) ? e.message : e);
						}
						
					return deferred.promise;

				};

				this.emit = function (p_sOrder, p_vData) {
					m_clSocketServer.sockets.emit(p_sOrder, p_vData);
				};
				
				this.emitTo = function (p_sToken, p_sOrder, p_vData) {

					if (m_stSocketsConnected[p_sToken]) {
						m_stSocketsConnected[p_sToken].emit(p_sOrder, p_vData);
					}

				};
				
				this.onConnection = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnConnection.push(p_fCallback);
					}
					
					return that;
					
				};
				
				this.onDisconnect = function (p_fCallback) {

					if ('function' === typeof p_fCallback) {
						m_tabOnDisconnect.push(p_fCallback);
					}
							
					return that;
					
				};
				
				this.getConnectedChilds = function () {

					var tabResult = [];

						for (var token in m_stSocketsConnected) {
							tabResult.push(m_stSocketsConnected[token].MIA);
						}

					return tabResult;

				};
				
	};
	