
// dépendances
	
// module
	
	module.exports = function (p_clHTTPSocket, p_clChildSocket, p_clSIKYAPI) {

		// attributes
			
			var m_stSIKYUser;
			
		// constructor

			p_clHTTPSocket.onConnection(function(socket) {

				socket.on('login', function (p_stData) {

					if (m_stSIKYUser && m_stSIKYUser.email == p_stData.email && m_stSIKYUser.password == p_stData.password) {
						socket.emit('login_ok');
					}
					else {

						p_clSIKYAPI.login(p_stData.email, p_stData.password)
							.then(function () {

								m_stSIKYUser = {
									token : p_clSIKYAPI.getToken(),
									email : p_stData.email,
									password : p_stData.password
								};

								m_clLog.success('-- [socket server] logged to SIKY');
								socket.emit('login_ok');
								
							})
							.catch(function (m_sError) {
								m_clLog.err(m_sError);
								socket.emit('login_ko', m_sError);
							});
							
					}

				});
										
			});

	};
