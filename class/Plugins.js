
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

										var plugin = JSON.parse(fs.readFileSync(sFile, 'utf8'));

										if (plugin.main && '' != plugin.main) {
											plugin.main = path.join(m_sPluginsPath, directory, plugin.main);
										}

										if (plugin.web) {

											if (plugin.web.templates && plugin.web.templates.widget) {
												plugin.web.templates.widget = path.join(m_sPluginsPath, directory, plugin.web.templates.widget);
											}

											if (plugin.web.javascripts && 0 < plugin.web.javascripts.length) {

												for (var i = 0, l = plugin.web.javascripts.length; i < l; ++i) {
													plugin.web.javascripts[i] = path.join(m_sPluginsPath, directory, plugin.web.javascripts[i]);
												}

											}

										}

										m_tabData.push(plugin);

									}
									catch (e) { console.log(e); }

								}

							});

						}

						deferred.resolve(m_tabData);

					return deferred.promise;

				};
				
	};
	