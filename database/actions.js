
"use strict";

// deps

// module

module.exports = class DBActions extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS actions (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" id_user INTEGER," +
						" id_child INTEGER," +
						" id_type INTEGER," +
						" name VARCHAR(50) NOT NULL," +
						" params VARCHAR(150) DEFAULT NULL," +
						" FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE" +
						" FOREIGN KEY(id_child) REFERENCES childs(id) ON DELETE CASCADE ON UPDATE CASCADE" +
						" FOREIGN KEY(id_type) REFERENCES actionstypes(id) ON DELETE CASCADE ON UPDATE CASCADE" +
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
