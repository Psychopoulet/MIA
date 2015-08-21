
// dépendances
	
// module
	
	module.exports = function (p_clSocket, p_clW3VoicesManager) {

		p_clSocket.on('w3', function (data) {

			if (data.action) {

				switch (data.action) {

					case 'get_races' :
					
						console.log(data.races);

					break;

					case 'get_musics' :
					
						console.log(data.musics);

					break;

					case 'get_warnings' :
					
						console.log(data.warnings);

					break;

					case 'get_characters' :
					
						console.log(data.characters);

					break;

					case 'get_actions' :
					
						console.log(data.actions);

					break;

					case 'get_action_codes' :
					
						console.log(data.action_codes);

					break;

				}

			}

		});
		
		// p_clSocket.emit('w3', { action : 'play_music', race : 'human', music : '1' } );

	};
