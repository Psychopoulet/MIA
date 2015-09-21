app.service('ModelWarcraftSounds', ['$q', function($q) {

    "use strict";

    // attributes

        var
            CST_THAT = this,
            m_tabOnChange = [],
            m_clPromiseGetAll,
            m_tabData = [];

    // methods

        // protected

            function _execOnChange() {

                angular.forEach(m_tabOnChange, function (p_fCallback) {
                    p_fCallback(m_tabData);
                });

                return CST_THAT;

            }

        // public

            this.onChange = function (p_fCallback) {

                if ('function' === typeof p_fCallback) {
                    m_tabOnChange.push(p_fCallback);
                }

                return CST_THAT;

            };

            // read

                this.getAll = function () {

                    var defer = $q.defer();

                        if (0 < m_tabData.length) {
                            defer.resolve(m_tabData);
                        }
                        else {

                            m_clPromiseGetAll
                                .then(defer.resolve)
                                .catch(defer.resolve);

                        }

                    return defer.promise;

                };

    // constructor

        // data

            socket
                .on('disconnect', function () {

                    socket.removeAllListeners('child.warcraftsounds.getall');
                    socket.removeAllListeners('child.warcraftsounds.error');

                    m_tabData = [];

                })
                .on('connect', function () {

                    var deferred = $q.defer();
                    m_clPromiseGetAll = deferred.promise;

                    socket
                        .on('child.logged', function () {
                            socket.emit('child.warcraftsounds.getall');
                        })
                        .on('child.warcraftsounds.getall', function (p_tabData) {
                            m_tabData = p_tabData;
                            _execOnChange();
                            deferred.resolve(m_tabData);
                        })
                        .on('child.warcraftsounds.error', deferred.reject);

                });

}]);