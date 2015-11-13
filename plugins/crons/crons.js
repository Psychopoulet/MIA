
// dépendances
	
	var
		path = require('path'),
		cronjob = require('cron').CronJob, // https://github.com/ncb000gt/node-cron/blob/master/README.md
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Factory) {

		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'crons'));
				
		// constructor

			/*var job = new cronjob('* 00 * * * * *', function() {
			  	console.log(new Date());
			}, function () {
		    	console.log('done');
			}, true);*/

	};