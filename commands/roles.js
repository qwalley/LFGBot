module.exports = {
	name: 'roles',
	description: 'Outputs the roles available to mention on the server the command was called from.',
	async execute(msg, args) {
		try {
			const roles = await msg.guild.roles.fetch();
			const mentionRoles = roles.cache.filter(role => role.mentionable);
			const output = mentionRoles.map(role => `(${role.id})\t${role.name}`);
			return await msg.reply('```' + output.join('\n') + '```');
		} catch (error) {
			throw `LFGBot/commands/roles.js:5 There was an error retreiving roles ${('\n' + e).replace(/\n/g, '\n\t')}`;
		}

	}
}