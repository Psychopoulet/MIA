app.factory("$actionstypes", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "actionstypes");
}]);