app.controller('ControllerWarcraftSounds', ['$scope', 'ModelWarcraftSounds', function($scope, ModelWarcraftSounds) {

	"use strict";

	// attributes

		$scope.loading = true;

        $scope.data = [];
		$scope.selectedrace = null;

    // constructor

        // events

            ModelWarcraftSounds
                .onChange(function (p_tabData) {
                    console.log(p_tabData);
                    $scope.data = p_tabData;
                });

			jQuery('#menuWarcraft').click(function(e) {
				e.preventDefault();
				jQuery('#modalWarcraft').modal('show');
			});
                
            jQuery('#modalWarcraft').on('shown.bs.modal', function() {

                ModelWarcraftSounds.getAll()
                    .catch(alert)
                    .finally(function() {
                        $scope.loading = false;
                    });

            });

}]);