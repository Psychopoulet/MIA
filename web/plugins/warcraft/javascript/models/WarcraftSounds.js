app.service('ModelWarcraftSounds', ['$q', function($q) {

    "use strict";

    // attributes

        var
            CST_THAT = this,
            m_tabRaces = [];

    // methods

        // public

            // read

                var isLoadingGetAllRaces = false, deferredGetAllRaces;
                this.getAllRaces = function (p_bForceLoading) {

                    if (!isLoadingGetAllRaces) {

                        deferredGetAllRaces = $q.defer();

                        isLoadingGetAllRaces = true;

                        if (0 < m_tabRaces.length && ('undefined' == typeof p_bForceLoading || !p_bForceLoading)) {
                            deferredGetAllRaces.resolve(m_tabRaces);
                        }
                        else {

                        	m_tabRaces = [
	                        	{
									id : 1,
									name : 'witcher 9',
									url : 'https://www.youtube.com/embed/x6go-o0TNd4'
								},
								{
									id : 2,
									name : 'witcher 10',
									url : 'https://www.youtube.com/embed/gTgVcK8E7tM'
								}
							];

                        	deferredGetAllRaces.resolve(m_tabRaces);

                        }

                    }

                    return deferredGetAllRaces.promise;

                };

}]);