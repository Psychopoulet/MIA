
// dépendances

	require('colors');

// module

	module.exports = function (p_sPathLogDirectory) {
		
		// attributes
			
			var m_sLogsDirectory = p_sPathLogDirectory;
			
		// methodes
			
			this.log = function (p_sMessage) {
				
				var sMessage = m_sLogsDirectory + ' : ' + p_sMessage;
				console.log(sMessage);
				
				return this;
				
			};
			
			this.success = function (p_sMessage) {
				
				var sMessage = m_sLogsDirectory + ' : ' + p_sMessage;
				console.log(sMessage.green);
				
				return this;
				
			};
			
			this.err = function (p_sMessage) {
				
				var sMessage = m_sLogsDirectory + ' : ' + p_sMessage;
				console.log(sMessage.red);
				
				return this;
				
			};
			
			this.info = function (p_sMessage) {
				
				var sMessage = m_sLogsDirectory + ' : ' + p_sMessage;
				console.log(sMessage.magenta);
				
				return this;
				
			};
			
			this.getLogsDirectory = function (p_sMessage) {
				return m_sLogsDirectory;
			};
			
	};
	