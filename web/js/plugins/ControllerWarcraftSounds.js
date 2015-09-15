app.controller('ControllerWarcraftSounds', ['$scope', 'ModelWarcraftSounds', function($scope, ModelSounds) {

	"use strict";

    // constructor

        // events

			jQuery('#menuWarcraft').click(function(e) {
				e.preventDefault();
				jQuery('#modalWarcraft').modal('show');
			});
                
            jQuery('#modalWarcraft').on('shown.bs.modal', function() {

            });

}]);