
// dépendances
	
	var path = require('path');
		
// attributes

	var
		m_clConfInstance = false,
		m_clPluginsInstance = false,
		m_clHTTPServerInstance = false,
		m_clHTTPSocketInstance = false,
		m_clChildSocketInstance = false,
		m_clSikyAPIInstance = false;

// module
	
	module.exports = {

		getConfInstance : function () {

			if (!m_clConfInstance) {
				var Conf = require(path.join(__dirname, 'Conf.js'));
				m_clConfInstance = new Conf();
			}

			return m_clConfInstance;

		},

		getPluginsInstance : function () {

			if (!m_clPluginsInstance) {
				var Plugins = require(path.join(__dirname, 'Plugins.js'));
				m_clPluginsInstance = new Plugins();
			}

			return m_clPluginsInstance;

		},

		getHTTPServerInstance : function () {

			if (!m_clHTTPServerInstance) {
				var HTTPServer = require(path.join(__dirname, 'HTTPServer.js'));
				m_clHTTPServerInstance = new HTTPServer();
			}

			return m_clHTTPServerInstance;

		},

		getHTTPSocketInstance : function () {

			if (!m_clHTTPSocketInstance) {
				var HTTPSocket = require(path.join(__dirname, 'HTTPSocket.js'));
				m_clHTTPSocketInstance = new HTTPSocket();
			}

			return m_clHTTPSocketInstance;

		},

		getChildSocketInstance : function () {

			if (!m_clChildSocketInstance) {
				var ChildSocket = require(path.join(__dirname, 'ChildSocket.js'));
				m_clChildSocketInstance = new ChildSocket();
			}

			return m_clChildSocketInstance;

		},

		getSikyAPIInstance : function () {

			if (!m_clSikyAPIInstance) {
				var SikyAPI = require(path.join(__dirname, 'SikyAPI.js'));
				m_clSikyAPIInstance = new SikyAPI();
			}

			return m_clSikyAPIInstance;

		}
	
	};
	