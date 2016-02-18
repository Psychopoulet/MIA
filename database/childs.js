
"use strict";

// deps

// module

module.exports = class DBChilds extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS childs (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" id_status INTEGER," +
						" token VARCHAR(100) NOT NULL UNIQUE," +
						" name VARCHAR(50) NOT NULL," +
						" FOREIGN KEY(id_status) REFERENCES status(id) ON DELETE CASCADE ON UPDATE CASCADE" +
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
