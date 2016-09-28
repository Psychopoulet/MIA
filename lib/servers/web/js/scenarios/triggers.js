app.factory("$triggers", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "triggers");
}]);