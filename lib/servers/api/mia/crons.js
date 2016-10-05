
"use strict";

module.exports = (container) => {

	// private

		// attrs

			let _running = [];

		// methods

			function _startCron(cron) {

				return container.get("crons").execute(cron, () => {
					console.log("test");
				}).then((cron) => {
					_running.push(cron);
					return Promise.resolve();
				}).catch((err) => {
					container.get("logs").err("-- [crons/" + cron.code + "] : " + err);
				});

			}

			function _stopCron(cron) {

				let index = -1;

					for (let i = 0; i < _running.length; ++i) {

						if (_running[i].code === cron.code) {
							index = i;
							break;
						}

					}

				if (-1 < index) {

					return new Promise((resolve) => {

						_running[index].job.stop();
						_running[index].job = null;

						_running.splice(index, 1);

						resolve();

					});

				}
				else {
					return Promise.reject("La tâche plannifiée n'est pas enregistrée comme active");
				}

			}

			function _isRunning(cron) {

				let running = false;

					for (let i = 0; i < _running.length; ++i) {

						if (_running[i].code === cron.code) {
							running = true;
							break;
						}

					}

				return running;

			}

	// run crons

		container.get("crons").search().then((crons) => {

			crons.forEach((cron) => {
				_startCron(cron);
			});

			return Promise.resolve();

		}).catch((err) => {
			container.get("logs").err("-- [crons] : " + err);
		});

	// api

		container.set(

			"servers.app",

			container.get("servers.app").get("/api/crons", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					container.get("crons").search().then((crons) => {

						crons.forEach((cron, i) => {
							crons[i].running = _isRunning(cron);
						});

						container.get("servers.web").sendValidJSONResponse(req, res, crons);

					}).catch((err) => {

						err = (err.message) ? err.message : err;

						container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
						container.get("logs").err("-- [database/crons/search] " + err);

					});

				});

			}).get("/api/crons/:code", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-searchone-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-searchone-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-searchone-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						container.get("crons").searchOne({ code: req.params.code.trim() }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-searchone-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else {
								cron.running = _isRunning(cron);
								container.get("servers.web").sendValidJSONResponse(req, res, cron);
							}
							
						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/crons/searchone] " + err);
								
						});
							
					}

				});

			}).get("/api/crons/:code/actions", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-actions-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-actions-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-actions-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						let croncode = req.params.code.trim();

						container.get("crons").searchOne({ code: croncode }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-actions-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else if (!cron.trigger) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-actions-031", message: "La tâche plannifiée n'est liée à aucun déclencheur" } ]);
							}
							else {

								container.get("actions").search({ trigger: cron.trigger }).then((actions) => {
									container.get("servers.web").sendCreatedJSONResponse(req, res, actions);
								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/actions/search] " + err);
										
								});

							}
							
						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/crons/searchone] " + err);
								
						});
							
					}

				});

			}).get("/api/crons/:code/scenarios", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-scenarios-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-scenarios-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-scenarios-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						let croncode = req.params.code.trim();

						container.get("crons").searchOne({ code: croncode }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-scenarios-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else if (!cron.trigger) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-scenarios-031", message: "La tâche plannifiée n'est liée à aucun déclencheur" } ]);
							}
							else {

								container.get("scenarios").search({ trigger: cron.trigger }).then((scenarios) => {
									container.get("servers.web").sendCreatedJSONResponse(req, res, scenarios);
								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/scenarios/search] " + err);
										
								});

							}

						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/crons/searchone] " + err);
								
						});
							
					}

				});

			}).put("/api/crons", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then((myDevice) => {

					if ("object" !== typeof req.body) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.body.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.body.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
						else if ("string" !== typeof req.body.name) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-023", message: "La tâche plannifiée n'a pas de nom" } ]);
						}
							else if ("" === req.body.name.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-024", message: "Le nom de la tâche plannifiée est vide" } ]);
							}
						else if ("object" !== typeof req.body.timer) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-030", message: "La tâche plannifiée n'a pas de timer" } ]);
						}
							else if ("string" !== typeof req.body.timer.second) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-031", message: "La tâche plannifiée n'a pas de seconde" } ]);
							}
								else if ("" === req.body.timer.second.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-032", message: "La seconde de la tâche plannifiée est vide" } ]);
								}
							else if ("string" !== typeof req.body.timer.minute) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-033", message: "La tâche plannifiée n'a pas de minute" } ]);
							}
								else if ("" === req.body.timer.minute.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-034", message: "La minute de la tâche plannifiée est vide" } ]);
								}
							else if ("string" !== typeof req.body.timer.hour) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-035", message: "La tâche plannifiée n'a pas d'heure" } ]);
							}
								else if ("" === req.body.timer.hour.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-036", message: "L'heure de la tâche plannifiée est vide" } ]);
								}
							else if ("string" !== typeof req.body.timer.monthday) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-037", message: "La tâche plannifiée n'a pas de jour du mois" } ]);
							}
								else if ("" === req.body.timer.monthday.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-038", message: "Le jour du mois de la tâche plannifiée est vide" } ]);
								}
							else if ("string" !== typeof req.body.timer.month) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-039", message: "La tâche plannifiée n'a pas de mois" } ]);
							}
								else if ("" === req.body.timer.month.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-040", message: "Le mois de la tâche plannifiée est vide" } ]);
								}
							else if ("string" !== typeof req.body.timer.weekday) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-041", message: "La tâche plannifiée n'a pas de jour de la semaine" } ]);
							}
								else if ("" === req.body.timer.weekday.trim()) {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-042", message: "Le jour de la semaine de la tâche plannifiée est vide" } ]);
								}
						else if (!req.body.trigger) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-050", message: "La tâche plannifiée n'a pas de déclencheur" } ]);
						}
							else if (!req.body.trigger.id) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-add-051", message: "Le déclencheur de la tâche plannifiée est vide" } ]);
							}
					else {

						req.body.user = myDevice.user;

						container.get("crons").add(req.body).then((cron) => {

							container.get("servers.web").sendCreatedJSONResponse(req, res, cron);

							container.get("crons").search().then((crons) => {
								container.get("servers.web").emit("crons", crons);
							}).catch((err) => {
								
								err = (err.message) ? err.message : err;

								container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
								container.get("logs").err("-- [database/crons/search] " + err);
									
							});
						
						}).catch((err) => {

							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/devices/add] " + err);
								
						});

					}

				});
						
			}).post("/api/crons/start/:code", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-start-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-start-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-start-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						container.get("crons").searchOne({ code: req.params.code.trim() }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-start-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else {

								_startCron(cron).then(() => {
									
									container.get("servers.web").sendValidJSONResponse(req, res);

									container.get("crons").search().then((crons) => {
										container.get("servers.web").emit("crons", crons);
									}).catch((err) => {
										container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {
									container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-start-040", message: "La tâche plannifiée ne peut pas être démarrée" } ]);
								});

							}

						});

					}

				});

			}).post("/api/crons/stop/:code", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-stop-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-stop-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-stop-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						container.get("crons").searchOne({ code: req.params.code.trim() }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-stop-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else {

								_stopCron(cron).then(() => {
									
									container.get("servers.web").sendValidJSONResponse(req, res);

									container.get("crons").search().then((crons) => {
										container.get("servers.web").emit("crons", crons);
									}).catch((err) => {
										container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/crons/stop] " + err);
										
								});

							}

						});

					}

				});

			}).delete("/api/crons/:code", (req, res) => {

				container.get("servers.web").checkAPI_userAllowed(req, res).then(() => {

					if ("object" !== typeof req.params) {
						container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-delete-020", message: "Il manque la tâche plannifiée" } ]);
					}
						else if ("string" !== typeof req.params.code) {
							container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-delete-021", message: "La tâche plannifiée n'a pas de code" } ]);
						}
							else if ("" === req.params.code.trim()) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-delete-022", message: "Le code de la tâche plannifiée est vide" } ]);
							}
					else {

						container.get("crons").searchOne({ code: req.params.code.trim() }).then((cron) => {

							if (!cron) {
								container.get("servers.web").sendWrongRequestJSONResponse(req, res, [ { code: "crons-delete-030", message: "La tâche plannifiée n'existe pas" } ]);
							}
							else {

								_stopCron(cron).then(() => {
									return container.get("crons").delete(cron);
								}).then(() => {
									
									container.get("servers.web").sendDeletedJSONResponse(req, res);

									container.get("crons").search().then((crons) => {
										container.get("servers.web").emit("crons", crons);
									}).catch((err) => {
										container.get("logs").err("-- [database/devices/search] " + ((err.message) ? err.message : err));
									});

								}).catch((err) => {
									
									err = (err.message) ? err.message : err;

									container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
									container.get("logs").err("-- [database/crons/searchone] " + err);
										
								});

							}
							
						}).catch((err) => {
							
							err = (err.message) ? err.message : err;

							container.get("servers.web").sendInternalErrorJSONResponse(req, res, err);
							container.get("logs").err("-- [database/crons/searchene] " + err);
								
						});

					}

				});

			})

		);

};
