const config = require('../config.json');
const Discord = require('discord.js');

const embed = (description, author, invite, group_type) => {
	return inviteEmbed = new Discord.MessageEmbed()
		.setColor(config.tag_roles[group_type][1])
		.setTitle(description)
		.setAuthor(author.nickname, author.user.avatarURL())
		.setDescription(`Join them on Discord, in [${invite.channel.name}](${invite})`)
		.addField('LFG Role:', `<@&${config.tag_roles[group_type][0]}>`, false)
		.setTimestamp()
		.setFooter('React with ❌ to delete this message')
}

module.exports = {
	name: 'lfg',
	description: 'create a group invitation for anykind of content',
	async execute(msg, args) {
		const guild = msg.client.guilds.resolve(config.master);
		const voice = guild.voiceStates.resolve(msg.author.id);
		
		// delete message to keep channel clean
		await msg.delete();

		if (!(voice && voice.channel)) {
			// tell user to be in a voice channel on the main server
			msg.author.send('You must be in a voice channel to host content!');
			return;
		}
		
		if (args.length < 2) {
			// tell user to include a description
			msg.author.send('Please provide a description of what you\'re doing.');
			return;
		}
		const group_type = args.shift().toLowerCase();
		if (!(group_type in config.tag_roles)) {
			// tell user the group type "_" is unsupported
			msg.author.send(`"${group_type}" is not a valid group type. Please use one of "hellgate", "famefarm", "gank"`);
			return;
		}
		const description = args.join(' ');
		const author = guild.members.resolve(msg.author.id);
		const channel = guild.channels.resolve(voice.channel);
		let invite = await channel.createInvite();
		
		msg.channel.send(embed(description, author, invite, group_type))
			.then(message => message.react('❌'))
	}

}
