
// dépendances
	
	var
		CST_DEP_Path = require('path');
		
// module
	
	module.exports = function (p_clChildSocket) {

		p_clChildSocket.on('temperature', function (data) {
				//console.log(data);
			});
			
	};
