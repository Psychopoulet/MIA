
"use strict";

// deps

// module

module.exports = class DBActionsTypes extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS actionstypes (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" name VARCHAR(50) NOT NULL," +
						" command VARCHAR(100) NOT NULL" +
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
