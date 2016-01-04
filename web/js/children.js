app.service('ModelChildren', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnChange = [];

    // methods

        // public

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

    // constructor

		socket.on('web.childs', function (children) {

			angular.forEach(m_tabOnChange, function (p_fCallback) {
                p_fCallback(children);
            });

		});

});

app.controller('ControllerChildren', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

    "use strict";

	$scope.children = [];

	ModelChildren.onChange(function(p_tabData) {
		$scope.children = p_tabData;
		$scope.$apply();
	});
	
}]);