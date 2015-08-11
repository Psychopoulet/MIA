
// dépendances

	var
		CST_DEP_Path = require('path'),
		CST_DEP_Launcher = require(CST_DEP_Path.join(__dirname, 'class', 'Launcher.js'));

// run

	try {
		
		new CST_DEP_Launcher();
		
	}
	catch (e) {
		console.log('Global script failed : ');
		console.log(e);
	}
	