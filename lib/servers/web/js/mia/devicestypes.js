app.factory("$devicestypes", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "devicestypes");
}]);