app.service("$status", ["$q", "$MIA", function($q, $MIA) {

	"use strict";

	// private

		// attrs

			var _data = [], _onRefresh = [], that = this;

	// public

		// attrs

			this.module = "status";

		// methods

			// read

			this.search = function(params) {

				if (params) {
					return $MIA.search(that.module, params);
				}
				else {
					return $MIA.search(that.module);
				}
				
			};

			this.searchOne = function(code) {
				return $MIA.searchOne(that.module, code);
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
				return $MIA.add(that.module, data).then(that.refresh);
			};

			this.edit = function(code, data) {
				return $MIA.edit(that.module, code, data).then(that.refresh);
			};

			this.delete = function(code) {
				return $MIA.delete(that.module, code).then(that.refresh);
			};

	// init

		$MIA.onLogin(that.refresh);
	
}]);