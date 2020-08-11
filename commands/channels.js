module.exports = {
	name: 'channels',
	description: 'lists all available channels',
	execute(msg, args) {
		let channels = msg.client.channels.cache.map(c => c.name).join('\n')
		msg.reply(channels)
		console.log(msg.client.channels)
	}
}