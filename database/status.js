
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

						that.add({ code : 'ACCEPTED', name : 'Accepté(e)', color : 'green' }).then(function() {

							that.add({ code : 'BLOCKED', name : 'Bloqué(e)', color : 'red' }).then(function() {
								
								that.add({ code : 'WAITING', name : 'En attente', color : 'yellow' }).then(function() {
									that.getAll().then(resolve).catch(reject);
								}).catch(reject);

							}).catch(reject);
							
						}).catch(reject);
						
					}

				});

			}).catch(reject);

		});

	}

	add (status) {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				if (!status) {
					reject('Aucun utilisateur renseigné.');
				}
				else if (!status.code) {
					reject('Aucun code renseigné.');
				}
				else if (!status.name) {
					reject('Aucun nom renseigné.');
				}
				else if (!status.color) {
					reject('Aucune couleur renseignée.');
				}
				else {

					that.db.run(
						"INSERT INTO status (code, name, color) VALUES (:code, :name, :color);", {
							':code': status.code,
							':name': status.name,
							':color': status.color
						}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.lastInserted().then(resolve).catch(reject);
						}

					});

				}

			}).catch(reject);

		});

	}

	lastInserted() {

		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.get("SELECT id, code, name, color FROM status ORDER BY id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(row);
					}

				});

			}).catch(reject);

		});

	}

	getAll() {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			that.init().then(function() {

				that.db.all("SELECT id, code, name, color FROM status;", [], function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve(rows);
					}

				});

			}).catch(reject);

		});

	}

};
