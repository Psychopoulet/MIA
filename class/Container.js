
// dépendances
	
	var path = require('path');
		
// attributes

	var
		m_clConfInstance = false,
		m_clPluginsInstance = false,
		m_clHTTPServerInstance = false,
		m_clHTTPSocketInstance = false,
		m_clChildSocketInstance = false,
		m_clSikyAPIInstance = false,
		m_clOpenSSLInstance = false;

// module
	
	module.exports = {

		get : function(p_sInstanceName) {

			switch(p_sInstanceName) {

				case 'conf':

					if (!m_clConfInstance) {
						var Conf = require(path.join(__dirname, 'Conf.js'));
						m_clConfInstance = new Conf();
					}

					return m_clConfInstance;

				break;

				case 'openssl':

					if (!m_clOpenSSLInstance) {
						var OpenSSL = require(path.join(__dirname, 'OpenSSL.js'));
						m_clOpenSSLInstance = new OpenSSL();
					}

					return m_clOpenSSLInstance;

				break;

				case 'plugins':

					if (!m_clPluginsInstance) {
						var Plugins = require(path.join(__dirname, 'Plugins.js'));
						m_clPluginsInstance = new Plugins();
					}

					return m_clPluginsInstance;

				break;

				case 'server.http':

					if (!m_clHTTPServerInstance) {
						var HTTPServer = require(path.join(__dirname, 'HTTPServer.js'));
						m_clHTTPServerInstance = new HTTPServer();
					}

					return m_clHTTPServerInstance;

				break;

				case 'server.socket.web':

					if (!m_clHTTPSocketInstance) {
						var HTTPSocket = require(path.join(__dirname, 'HTTPSocket.js'));
						m_clHTTPSocketInstance = new HTTPSocket();
					}

					return m_clHTTPSocketInstance;

				break;

				case 'server.socket.child':

					if (!m_clChildSocketInstance) {
						var ChildSocket = require(path.join(__dirname, 'ChildSocket.js'));
						m_clChildSocketInstance = new ChildSocket();
					}

					return m_clChildSocketInstance;

				break;

				case 'sikyapi':

					if (!m_clSikyAPIInstance) {
						var SikyAPI = require(path.join(__dirname, 'SikyAPI.js'));
						m_clSikyAPIInstance = new SikyAPI();
					}

					return m_clSikyAPIInstance;

				break;

				// errors

				case '':
					throw "Container : empty module";
				break;
				default:
					throw "Container : unknown module '" + p_sInstanceName + "'";
				break;
				
			}

		}
		
	};
	