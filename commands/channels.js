const config = require('../config.json');

module.exports = {
	name: 'channels',
	description: 'lists all available channels',
	execute(msg, args) {
		// make array of fetch promises
		let channel_promises = config.broadcast_channels.map(id => msg.client.channels.fetch(id))
		channel_promises.push(msg.client.channels.fetch(config.master_channel))
		// wait for all promises to either resolve or reject
		Promise.allSettled(channel_promises)
			.then(results => {
				// return array of channel names, or warnings for channels that didn't fulfill
				return results.map(result => {
					if (result.status == 'fulfilled') {
						return `${result.value.name} (id: ${result.value.id}, server: ${result.value.guild.name})`;
					}
					else {
						return `Cannot find ${result.reason.path}`;
					} 
				});
			})
			// reply with formatted list of channel names
			.then(channel_names => {
				msg.reply('Listening to the following channels:\n' + channel_names.join('\n'))
			})
			.catch(error => {
				msg.reply("Something wen't wrong, please try again later.");
				console.log(error);
			})
	}
}