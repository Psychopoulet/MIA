app.factory("$controllerstypes", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "controllerstypes");
}]);