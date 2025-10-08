app.factory("$scenarios", ["$q", "$MIA", function ($q, $MIA) {
	return new AbstractMIAModel($q, $MIA, "scenarios");
}]);

jQuery(document).ready(function() {

	jQuery("#navScenarios").click(function() {

		jQuery("#modalScenarios").modal({
			backdrop: "static",
			keyboard: true,
			show: true
		});

		return false;

	});

});
