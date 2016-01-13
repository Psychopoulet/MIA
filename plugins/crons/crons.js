
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

			new cronjob('00 00 16 * * 1-5', function() {

				Container.get('server.socket.child').emit('media.video.play', {
					"name":"Café !",
					"url":"https://www.youtube.com/watch?v=zIA0kaGFIhQ",
					"urlembeded":"https://www.youtube.com/embed/zIA0kaGFIhQ",
					"code":"hLcJuWVd6hw"
				});

			}, null, true);

			new cronjob('00 00 12 * * 1-5', function() {

				Container.get('server.socket.child').emit('media.video.play', {
					"url":"https://www.youtube.com/watch?v=2KqsR_ko5TU",
					"name":"Manger !",
					"urlembeded":"https://www.youtube.com/embed/2KqsR_ko5TU",
					"code":"2KqsR_ko5TU"
				});

			}, null, true);

	};