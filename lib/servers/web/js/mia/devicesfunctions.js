app.factory("$devicesfunctions", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "devicesfunctions");
}]);