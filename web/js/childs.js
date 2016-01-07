app.service('ModelChilds', function() {

    "use strict";

    // attributes

        var
            that = this,
            m_tabOnError = [],
            m_tabOnChange = [];

    // methods

        // public

            this.onError = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnError.push(p_fCallback);
                }

                return that;

            };

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return that;

            };

            this.allow = function (child) {
                socket.emit('web.child.allow', child);
                return that;
            };

            this.delete = function (child) {
                socket.emit('web.child.delete', child);
                return that;
            };

    // constructor

        socket.on('web.child.allow.error', function (p_sMessage) {

            angular.forEach(m_tabOnError, function (p_fCallback) {
                p_fCallback(p_sMessage);
            });

        })
        .on('web.child.delete.error', function (p_sMessage) {

            angular.forEach(m_tabOnError, function (p_fCallback) {
                p_fCallback(p_sMessage);
            });

        })
        .on('web.childs', function (childs) {

            angular.forEach(m_tabOnChange, function (p_fCallback) {
                p_fCallback(childs);
            });

        });

});

app.controller('ControllerChilds', ['$scope', '$popup', 'ModelChilds', function($scope, $popup, ModelChilds) {

    "use strict";

	$scope.childs = [];

	ModelChilds.onError($popup.alert)
    .onChange(function(p_tabData) {
		$scope.childs = p_tabData;
		$scope.$apply();
	});
	
    $scope.allow = ModelChilds.allow;
    $scope.delete = ModelChilds.delete;
    
}]);