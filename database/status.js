
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" status.id," +
		" status.code," +
		" status.name," +
		" status.backgroundcolor," +
		" status.textcolor" +

	" FROM status";

// module

module.exports = class DBStatus extends require("node-scenarios").abstract {

	// read

		last () {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY status.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBStatus.formate(row) : {});
					}

				});

			});

		}





// @TODO : search






	getAll () {
		
		return new Promise((resolve, reject) => {

			this.db.all("SELECT id, code, name, backgroundcolor, textcolor FROM status;", [], (err, rows) => {

				if (err) {
					reject((err.message) ? err.message : err);
				}
				else {
					resolve((rows) ? rows : []);
				}

			});

		});

	}

	getOneByCode (code) {
		
		return new Promise((resolve, reject) => {

			this.getAll().then((status) => {

				let stResult;

				for (let i = 0; i < status.length; ++i) {

					if (status[i].code === code) {
						stResult = status[i];
						break;
					}

				}

				if (stResult) {
					resolve(stResult);
				}
				else {
					reject("Le code statut '" + code + "' n'existe pas.");
				}

			})
			.catch(reject);

		});

	}

	// write

		add (status) {

			return new Promise((resolve, reject) => {

				if (!status) {
					reject('Aucun utilisateur renseigné.');
				}
				else if (!status.code) {
					reject('Aucun code renseigné.');
				}
				else if (!status.name) {
					reject('Aucun nom renseigné.');
				}
				else if (!status.backgroundcolor) {
					reject('Aucune couleur de fond renseignée.');
				}
				else if (!status.textcolor) {
					reject('Aucune couleur de texte renseignée.');
				}
				else {

					this.db.run("INSERT INTO status (code, name, backgroundcolor, textcolor) VALUES (:code, :name, :backgroundcolor, :textcolor);", {
						':code': status.code,
						':name': status.name,
						':backgroundcolor': status.backgroundcolor,
						':textcolor': status.textcolor
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							this.last().then(resolve).catch(reject);
						}

					});

				}

			});

		}





// @TODO : edit & delete






};
