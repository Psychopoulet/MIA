
// dépendances
	
	var
		fs = require('fs'),
		q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";
		
		// attributes
			
			var
				that = this,
				m_stConf = { };
				
		// methodes
			
			// public

				this.get = function (p_sKey, p_vValue) {
					return (m_stConf[p_sKey]) ? m_stConf[p_sKey] : '';
				};

				this.set = function (p_sKey, p_vValue) {
					m_stConf[p_sKey] = p_vValue;
					return that;
				};
				
		// constructor

			m_stConf = { webport: 1337, childrenport: 1338, debug: false, ssl: false };
			
	};
	