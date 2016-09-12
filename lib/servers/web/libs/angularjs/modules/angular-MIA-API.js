angular.module("ngMIAAPI", ["ngToken"]).service("$MIA", [ "$http", "$q", "$token", function($http, $q, $token) {

	"use strict";

	// private

		// attrs

			var _onLoginEvents = [];

		// methods

			function _errorToHTML(errors) {

				var result = "";

					if (errors instanceof Array) {

						var tresult = [];
						for (var i = 0; i < errors.length; ++i) {

							if (errors[i].message) {
								tresult.push(errors[i].message);
							}

						}

						for (var i = 0; i < tresult.length; ++i) {

							if (0 < i || (0 == i && 1 < tresult.length)) {
								result += "- " + tresult[i];
							}
							else {
								result += tresult[i];
							}

							if (i < tresult.length - 1) {
								result += "<br />";
							}

						}

					}
						
					if (!result) {
						result = "Impossible de lire l'erreur générée par l'API";
					}

				return result;
					
			}

				function _APIErrorToHTML(err) {

					if (err && "string" === typeof err) {
						return err;
					}
					else if (err && err.data && "string" === typeof err.data) {
						return err.data;
					}
					else if (!err || !err.data) {
						return "Erreur non documentée par l'API";
					}
					else {
						return (_errorToHTML( ("object" === typeof err.data.errors && err.data.errors instanceof Array) ? err.data.errors : "" ));
					}

				}

	// public

		this.APIErrorToHTML = _APIErrorToHTML;

		this.onLogin = function(eventListener) {

			if ("function" === typeof eventListener) {
				_onLoginEvents.push(eventListener);
			}

		};

		this.fireLogged = function() {

			for (var i = 0; i < _onLoginEvents.length; ++i) {
				_onLoginEvents[i]();
			}

		};

		this.search = function(module, params) {

			return $q(function(resolve, reject) {

				var headers = {};

				if ($token.get()) {
					headers.authorization = $token.get();
				}
				if (params) {
					headers.params = params;
				}

				$http.get("/api/" + module.toLowerCase(), { headers : headers }).then(function(res) {

					if (res && res.data && 0 < res.data.length) {
						resolve(res.data);
					}
					else {
						resolve([]);
					}

				}).catch(function(err) {
					reject({ message: _APIErrorToHTML(err), status : err.status });
				});

			});

		};

		this.searchOne = function(module, code) {

			return $q(function(resolve, reject) {

				$http.get("/api/" + module.toLowerCase() + "/" + code, {
					headers : ($token.get()) ? { authorization: $token.get() } : {}
				}).then(function(res) {

					if (res && res.data) {
						resolve(res.data);
					}
					else {
						resolve(null);
					}
					
				}).catch(function(err) {
					reject({ message: _APIErrorToHTML(err), status : err.status });
				});

			});

		};

		this.add = function(module, params) {

			return $q(function(resolve, reject) {

				$http.put("/api/" + module.toLowerCase(), params, {
					headers : ($token.get()) ? { authorization: $token.get() } : {}
				}).then(function(res) {

					if (res && res.data) {
						resolve(res.data);
					}
					else {
						resolve(null);
					}
					
				}).catch(function(err) {
					reject({ message: _APIErrorToHTML(err), status : err.status });
				});

			});

		};

		this.edit = function(module, code, data) {

			return $q(function(resolve, reject) {

				reject("'edit' en cours de création");

			});

		};

		this.delete = function(module, code) {

			return $q(function(resolve, reject) {

				$http.delete("/api/" + module.toLowerCase() + "/" + code, {
					headers : ($token.get()) ? { authorization: $token.get() } : {}
				}).then(function() {
					resolve();
				}).catch(function(err) {
					reject({ message: _APIErrorToHTML(err), status : err.status });
				});

			});

		};

		this.login = function(login, password) {

			return $q(function(resolve, reject) {

				$http.post("/api/users/login", {
					login: login,
					password: password
				}, {
					headers: ($token.get()) ? { authorization: $token.get() } : {}
				}).then(function(res) {

					if (res && res.data) {
						resolve(res.data);
					}
					else {
						resolve(null);
					}
					
				}).catch(function(err) {
					reject({ message: _APIErrorToHTML(err), status : err.status });
				});

			});

		};

}]);
