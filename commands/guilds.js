module.exports = {
	name: 'guilds',
	description: 'lists all available guilds',
	execute(msg, args) {
		let guilds = msg.client.guilds.cache.map(g => g.name).join('\n')
		msg.reply(`The guilds available to this Bot are:\n${guilds}`)
	}
}