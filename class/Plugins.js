
// dépendances
	
	var
		fs = require('fs'),
		path = require('path'),
		q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";

		// attributes

			// private

				var
					m_tabData = [], 
					m_sPluginsPath = path.join(__dirname, '..', 'plugins');

		// methodes
			
			// public

				this.getData = function () {

					var deferred = q.defer();

						if (0 >= m_tabData.length) {

							require('fs').readdirSync(m_sPluginsPath).forEach(function (directory) {

								var sFile = path.join(m_sPluginsPath, directory, 'package.json');

								if (fs.lstatSync(sFile).isFile()) {

									try {

										var stData = JSON.parse(fs.readFileSync(sFile, 'utf8'));

										if (stData.main && '' != stData.main) {
											stData.main = path.join(m_sPluginsPath, directory, stData.main);
											m_tabData.push(stData);
										}

									}
									catch (e) { }

								}

							});

						}

						deferred.resolve(m_tabData);

					return deferred.promise;

				};
				
	};
	