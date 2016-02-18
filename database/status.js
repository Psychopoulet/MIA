
"use strict";

// deps

// module

module.exports = class DBStatus extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS status (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" code VARCHAR(50) NOT NULL UNIQUE," +
						" name VARCHAR(50) NOT NULL," +
						" color VARCHAR(50) NOT NULL" +
					");", [], function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve();
					}

				});

			}).catch(reject);

		});

	}

};
