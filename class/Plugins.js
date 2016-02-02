
// dépendances
	
	const 	fs = require('simplefs'),
			path = require('path'),
			q = require('q');
		
// module
	
	module.exports = function () {

		"use strict";

		// attributes

			// private

				var that = this;

			// public

				this.directory = path.join(__dirname, '..', 'plugins');

		// methodes
			
			// public

				this.getData = function () {

					var deferred = q.defer(), tabData = [];

						fs.readdirSync(that.directory).forEach(function (directory) {

							var sFile = path.join(that.directory, directory, 'package.json');

							if (fs.fileExists(sFile)) {

								try {

									var plugin = JSON.parse(fs.readFileSync(sFile, 'utf8'));

									if (plugin.main && '' != plugin.main) {
										plugin.main = path.join(that.directory, directory, plugin.main);
									}

									if (plugin.web) {

										if (plugin.web.templates && plugin.web.templates.widget) {
											plugin.web.templates.widget = path.join(that.directory, directory, plugin.web.templates.widget);
										}

										if (plugin.web.javascripts && 0 < plugin.web.javascripts.length) {

											for (var i = 0, l = plugin.web.javascripts.length; i < l; ++i) {
												plugin.web.javascripts[i] = path.join(that.directory, directory, plugin.web.javascripts[i]);
											}

										}

									}

									tabData.push(plugin);

								}
								catch (e) { console.log(e); }

							}

						});

						deferred.resolve(tabData);

					return deferred.promise;

				};
				
	};
	