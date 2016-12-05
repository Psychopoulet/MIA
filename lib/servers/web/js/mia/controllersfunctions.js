app.factory("$controllersfunctions", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "controllersfunctions");
}]);