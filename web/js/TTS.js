app.controller('ControllerTTS', ['$scope', '$actions', '$popup', function($scope, $actions, $popup) {

    "use strict";

	// attributes

		// public

			$scope.childs = [];

	// methods

		$scope.execute = function(child, text) {

			socket.emit('tts', {
				child : child, text : text
			});

		};

		$scope.createAction = function (child, text) {
			$actions.add('Lire un texte', child, $actions.getActionTypeByCommand('tts'), text);
		};

	// constructor

		// events

			socket.on('childs', function (childs) {
		        $scope.$apply(function () { $scope.childs = childs; });
		    });

}]);

jQuery(document).ready(function() {

	jQuery('#navTTS').click(function() {

		jQuery('#modalTTS').modal({
			backdrop: 'static',
			keyboard: true,
			show: true
		});

		return false;

	});

});
