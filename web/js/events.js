app.service('ModelEvents', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnAdd = [];

    // methods

        // public

            this.add = function (p_sPicture, p_sApp, p_sText, p_bNotification) {

                angular.forEach(m_tabOnAdd, function (p_fCallback) {
                    p_fCallback(p_sPicture, p_sApp, p_sText);
                });

                return that;

            };

            this.onAdd = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnAdd.push(p_fCallback);
                }

                return that;

            };

});

app.controller('ControllerEvents', ['$scope', 'ModelEvents', function($scope, ModelEvents) {

	$scope.events = [];

	ModelEvents.onAdd(function (p_sPicture, p_sApp, p_sText) {

		$scope.events.unshift({
			picture : p_sPicture,
			app : p_sApp,
			text : p_sText
		});

	});
		
}]);