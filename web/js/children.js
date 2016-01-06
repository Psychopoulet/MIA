app.service('ModelChildren', function() {

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

            this.allow = function (client) {
                socket.emit('web.client.allow', client);
                return that;
            };

            this.delete = function (client) {
                socket.emit('web.client.delete', client);
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

app.controller('ControllerChildren', ['$scope', '$popup', 'ModelChildren', function($scope, $popup, ModelChildren) {

    "use strict";

	$scope.childs = [];

	ModelChildren.onError($popup.alert)
    .onChange(function(p_tabData) {
		$scope.childs = p_tabData;
		$scope.$apply();
	});
	
    $scope.allow = ModelChildren.allow;
    $scope.delete = ModelChildren.delete;
    
}]);