const config = require('../config.json');
const Discord = require('discord.js');

const embed = (description, author, invite, role) => {
	return inviteEmbed = new Discord.MessageEmbed()
		// .setColor('#0099ff')
		.setTitle(description)
		.setAuthor(author.nickname, author.user.avatarURL())
		.setDescription(`Join them on Discord, in [${invite.channel.name}](${invite})`)
		.addField('LFG Role:', `<@&${role}>`, false)
		.setTimestamp()
		.setFooter('React with ❌ to delete this message')
}

module.exports = async (args) => {
	const msg = args.msg;
	const guild = msg.client.guilds.resolve(config.master);
	const voice = guild.voiceStates.resolve(msg.author.id);
	
	// delete message to keep channel clean
	await msg.delete();

	if (!(voice && voice.channel)) {
		// tell user to be in a voice channel on the main server
		msg.author.send('You must be in a voice channel to host content!');
		return;
	}
	
	if (args.description.length < 1) {
		// tell user to include a description
		msg.author.send('Please provide a description of what you\'re doing.');
		return;
	}
	const description = args.description.join(' ');
	const author = guild.members.resolve(msg.author.id);
	const channel = guild.channels.resolve(voice.channel);
	let invite = await channel.createInvite();
	
	msg.channel.send(embed(description, author, invite, config.tag_roles[args.role]))
		.then(message => message.react('❌'))
}