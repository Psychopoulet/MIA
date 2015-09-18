app.controller('ControllerWarcraftSounds', ['$scope', 'ModelWarcraftSounds', function($scope, ModelSounds) {

	"use strict";

	// attributes

		$scope.loading = false;

        $scope.races = [];
		$scope.selectedrace = null;

    // constructor

        // events

			jQuery('#menuWarcraft').click(function(e) {
				e.preventDefault();
				jQuery('#modalWarcraft').modal('show');
			});
                
            jQuery('#modalWarcraft').on('shown.bs.modal', function() {

                $scope.loading = true;
                ModelSounds.getAllRaces()
                	.then(function(p_tabData) {
                		$scope.races = p_tabData;
                	})
                    .catch(alert)
                    .finally(function() {
                        $scope.loading = false;
                    });

            });

}]);