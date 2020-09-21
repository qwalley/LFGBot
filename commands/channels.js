const config = require('../config.json');

module.exports = {
	name: 'channels',
	description: 'lists all available channels',
	async execute(msg, args) {
		try {
			// make array of fetch promises
			let channel_promises = config.broadcast_channels.map(id => msg.client.channels.fetch(id))
			channel_promises.push(msg.client.channels.fetch(config.master_channel))
			// wait for all promises to either resolve or reject
			let results = await Promise.allSettled(channel_promises)
			// return array of channel names, or warnings for channels that didn't fulfill
			let channels = results.map(result => {
				if (result.status == 'fulfilled') {
					return `${result.value.name} (id: ${result.value.id}, server: ${result.value.guild.name})`;
				}
				else {
					return `Cannot find ${result.reason.path}`;
				} 
			});
			msg.reply('Listening to the following channels:\n' + channels.join('\n'))
		} catch(e) {
			throw 'LFGBot/commands/channels.js: There was an error loading channel names.' + ('\n' + e).replace(/\n/g, '\n\t');
		}
	}
}