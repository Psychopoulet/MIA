app.controller('ControllerUsers', ['$scope', '$popup', function($scope, $popup) {
		
    "use strict";

}]);

jQuery(document).ready(function() {

    jQuery('#navUsers').click(function() {

        jQuery('#modalUsers').modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });

        return false;

    });

});
