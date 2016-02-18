
"use strict";

// deps

	const	sqlite3 = require('sqlite3').verbose(),
			path = require('path');

// module

module.exports = class DBMain {

	constructor (db) {

		this.db = db;
		this.initialized = false;

	}

	init() {

		var that = this;

		return new Promise(function(resolve, reject) {

			if (that.initialized) {
				resolve();
			}
			else {

				that.db.serialize(function() {

					that.initialized = true;
					resolve();

				})
				.catch(function(err) {
					reject((err.message) ? err.message : err);
				});
				
			}

		});

	}

};
