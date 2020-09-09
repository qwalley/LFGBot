const config = require('../config.json');
const Discord = require('discord.js');

const inviteEmbed = async (description, author, channel, group_type) => {
	try {
		throw 'sample error'
		let invite = await channel.createInvite();
		const inviteEmbed = new Discord.MessageEmbed()
			.setColor(config.tag_roles[group_type][1])
			.setTitle(description)
			.setAuthor(`${author.nickname}`, author.user.avatarURL())
			.setDescription(`Join <@${author.id}> on Discord, in [${invite.channel.name}](${invite})`)
			.addField('LFG Role:', `<@&${config.tag_roles[group_type][0]}>`, false)
			.setTimestamp()
			.setFooter('React with ❌ to delete this message');
		return inviteEmbed;
	} catch(e) {
		throw 'LFGBot/commands/lfg.js:5 There was an error creating the invite.' + ('\n' + e).replace(/\n/g, '\n\t');
	}
}

const postInvite = (channel, embed) => {
	channel.send(embed)
		.then(message => {
			message.react('❌');
			return message;
		})
		// schedule each message to be deleted after two hours
		.then(message => {
			message.delete({timeout: 2*60*60*1000});
		})
		.catch(e => {
			throw `LFGBot/commands/lfg.js:24 There was an error sending to ${channel.name} (${channel.id} in ${channel.guild.name}) ${('\n' + e).replace(/\n/g, '\n\t')}`;
		});
}

module.exports = {
	name: 'lfg',
	description: 'create a group invitation for anykind of content',
	execute(msg, args) {
		const guild = msg.client.guilds.resolve(config.master_guild);
		const voice = guild.voiceStates.resolve(msg.author.id);

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

		return inviteEmbed(description, author, channel, group_type)
			.then(embed => {
				// build array of promises to post embed in each broadcast channel
				let send_promises = config.broadcast_channels.map(id => postInvite(msg.client.channels.resolve(id), embed))
				// add promise for master channel
				send_promises.push(postInvite(msg.client.channels.resolve(config.master_channel), embed));
				// allow all promises to settle
				Promise.allSettled(send_promises);
			})
			.catch(e => {
				throw 'LFGBot/commands/lfg.js:64 There was an error sending the embed.' + ('\n' + e).replace(/\n/g, '\n\t');
			});
	}
}
