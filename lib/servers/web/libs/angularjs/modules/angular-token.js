angular.module("ngToken", ["ngCookies"]).service("$token", [ "$cookies", function($cookies) {

	"use strict";

	this.get = function () {

		var result = "";

			if (localStorage) {
				result = localStorage.getItem("token");
			}
			if (!result) {
				result = $cookies.get("token");
			}

		return result;

	};

	this.set = function (token) {

		if (localStorage) {
			localStorage.setItem("token", token);
		}
		else {
			$cookies.put("token", token);
		}

	};

	this.delete = function () {

		if (localStorage) {
			localStorage.removeItem("token");
		}
		else {
			$cookies.remove("token");
		}

	};

}]);