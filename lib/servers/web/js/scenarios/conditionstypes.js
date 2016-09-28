app.factory("$conditionstypes", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "conditionstypes");
}]);