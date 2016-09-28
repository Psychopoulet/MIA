app.factory("$scenarios", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "scenarios");
}]);