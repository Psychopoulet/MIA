
"use strict";

// deps

// private

	var _pInsert;

// module

module.exports = class DBCrons {

	constructor (db) {
		this.db = db;
	}

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.db.run(
				"CREATE TABLE IF NOT EXISTS crons (" +
					" id INTEGER PRIMARY KEY AUTOINCREMENT," +
					" id_user INTEGER," +
					" name VARCHAR(50) NOT NULL," +
					" timer VARCHAR(50) NOT NULL," +
					" FOREIGN KEY(id_user) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE" +
			");", [], function(err) {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve([]);
				}

			});

		});

	}

};
