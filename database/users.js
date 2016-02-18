
"use strict";

// deps

	const crypto = require('crypto');

// module

module.exports = class DBUsers extends require(require('path').join(__dirname, 'main.js')) {

	create () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"CREATE TABLE IF NOT EXISTS users (" +
						" id INTEGER PRIMARY KEY AUTOINCREMENT," +
						" login VARCHAR(50) NOT NULL," +
						" password VARCHAR(100) NOT NULL" +
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

	addMain () {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.run(
					"INSERT INTO users (login, password) VALUES (:login, :password);", {
						':login': 'rasp',
						':password': crypto.createHash('sha1').update("MIA_password_MIA").digest('hex')
					}, function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve();
					}

				});

				/*that.db.prepare("INSERT INTO users (login, password) VALUES (:login, :password);")
				.run({
					':login': 'rasp',
					':password': crypto.createHash('sha1').update("MIA_password_MIA").digest('hex')
				})
				.finalize();*/

			}).catch(reject);

		});

	}

};
