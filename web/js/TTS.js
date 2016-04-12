app.controller('ControllerTTS', ['$scope', '$actions', '$popup', function($scope, $actions, $popup) {

    "use strict";

	// attributes

		// private

			var tabActionsTypes = [];

		// public

			$scope.childs = [];

	// methods

		$scope.execute = function(child, text) {

			socket.emit('tts', {
				child : child, text : text
			});

		};

		$scope.createAction = function (child, text) {

			for (var i = 0; i < tabActionsTypes.length; ++i) {

				if (tabActionsTypes[i].command == 'tts') {
					$actions.add('Lire un texte', child, tabActionsTypes[i], text);
					break;
				}

			}

		};

	// constructor

		// events

			// actionstypes

			socket.on('actionstypes', function(actionstypes) {
				$scope.$apply(function() { tabActionsTypes = actionstypes; });
			})

			// childs

		    .on('childs', function (childs) {
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
