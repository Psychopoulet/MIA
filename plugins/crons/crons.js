
// dépendances
	
	var
		path = require('path'),
		cronjob = require('cron').CronJob, // https://github.com/ncb000gt/node-cron/blob/master/README.md
		Logs = require(path.join(__dirname, '..', '..', 'class', 'Logs.js'));

// module
	
	module.exports = function (Container) {

		// attributes
			
			var
				m_clLog = new Logs(path.join(__dirname, '..', 'logs', 'plugins', 'crons'));
				
		// constructor

			var job = new cronjob('00 00 16 * * 1-5', function() {

				Container.get('server.socket.child').emit('media.video.play', {"name":"test","url":"https://www.youtube.com/watch?v=zIA0kaGFIhQ","urlembeded":"https://www.youtube.com/embed/zIA0kaGFIhQ","code":"hLcJuWVd6hw"});
			  	
			}, null, true);

	};