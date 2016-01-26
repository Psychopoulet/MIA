
// dépendances
	
	var
		path = require('path'),
		cronjob = require('cron').CronJob; // https://github.com/ncb000gt/node-cron/blob/master/README.md

// module
	
	module.exports = function (Container) {

		new cronjob('00 00 16 * * 1-5', function() {

			Container.get('childssockets').emit('media.video.play', {
				"name":"Café !",
				"url":"https://www.youtube.com/watch?v=JFjUOBP6vaI",
				"urlembeded":"https://www.youtube.com/embed/JFjUOBP6vaI",
				"code":"JFjUOBP6vaI"
			});

		}, null, true);

		new cronjob('00 00 12 * * 1-5', function() {

			Container.get('childssockets').emit('media.video.play', {
				"name":"Manger !",
				"url":"https://www.youtube.com/watch?v=ATy8bM8eeVQ",
				"urlembeded":"https://www.youtube.com/embed/ATy8bM8eeVQ",
				"code":"ATy8bM8eeVQ"
			});

		}, null, true);

	};