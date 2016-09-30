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

		this.fireLogged = function(device) {

			angular.forEach(_onLoginEvents, function(callback) {

				$q(function() {
					callback(device);
				});

			});

		};

		this.url = function(url) {

			return $q(function(resolve, reject) {

				var headers = {};

				$http.get(url, {
					headers : ($token.get()) ? { authorization: $token.get() } : {}
				}).then(function(res) {

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

		this.edit = function(module, code, params) {

			return $q(function(resolve, reject) {

				$http.post("/api/" + module.toLowerCase() + "/" + code, params, {
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

function AbstractMIAModel($q, $MIA, module, autorefresh) {

	"use strict";

	// private

		// attrs

			var _data = [], _onRefresh = [], that = this;

	// public

		// methods

			// read

			this.search = function(params) {

				if (params) {
					return $MIA.search(module, params);
				}
				else {
					return $MIA.search(module);
				}
				
			};

			this.searchOne = function(code) {
				return $MIA.searchOne(module, code);
			};

			this.refresh = function() {

				return that.search().then(function(data) {

					_data = data;

						angular.forEach(_onRefresh, function(callback) {

							$q(function() {
								callback(data);
							});

						});

					return $q.defer().resolve(data);

				});

			};

			this.onRefresh = function(callback) {

				if ("function" === typeof callback) {
					_onRefresh.push(callback);
				}

			};

			// write

			this.add = function(data) {

				return $MIA.add(module, data).then(function(data) {

					if (autorefresh) {
						return that.refresh();
					}
					else {
						return $q.resolve(data);
					}

				});

			};

			this.edit = function(code, data) {

				return $MIA.edit(module, code, data).then(function(data) {

					if (autorefresh) {
						return that.refresh();
					}
					else {
						return $q.resolve(data);
					}

				});

			};

			this.delete = function(code) {

				return $MIA.delete(module, code).then(function() {

					if (autorefresh) {
						return that.refresh();
					}
					else {
						return $q.resolve();
					}

				});

			};

	// init

		autorefresh = (autorefresh) ? autorefresh : true;

		$MIA.onLogin(that.refresh);
	
}
