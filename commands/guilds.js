const channelString = (channel) => {
	// build a string of the channels name, id and type that has a constant width
	dashes = '--------------------------------------------------';
	const name = channel.type === 'category' ? channel.name : '    ' + channel.name;
	return `\t${(name + ' ' + dashes).slice(0, 50)} (${channel.id}, ${channel.type})`;
}

module.exports = {
	name: 'guilds',
	description: 'lists all available guilds',
	execute(msg, args) {
		let guilds = msg.client.guilds.cache.map((guild) => {
			let channels = {}
			let ret = `${guild.name} (${guild.id}):`;
			// put channels in an array with their parent channel for clean formatting
			guild.channels.cache.map((channel) => {
				if (channel.type === 'category') {
					if (typeof channels[channel.id] === 'undefined') channels[channel.id] = [];
					// category channels should be the first element in each array
					channels[channel.id].unshift(channelString(channel))
				}
				else {
					if (typeof channels[channel.parentID] === 'undefined') channels[channel.parentID] = [];
					// non-category channels should follow their parent channel
					channels[channel.parentID].push(channelString(channel))
				}
			});

			for (const category in channels) {
				ret += `\n${channels[category].join('\n')}`;
			}
			return ret;
		});
		msg.reply('```' + guilds.join('\n') + '```').catch(console.error)
			.then(message => {
				message.delete({timeout: 2*60*60*1000});
			})
			.catch(console.error);
	}
}