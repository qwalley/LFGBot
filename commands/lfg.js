const config = require('../config.json');
const Discord = require('discord.js');
const utility = require('../utility.js');

// error handling here needs work, maybe switch to async function
const postInvite = async (channel, args, invite) => {
	let embed = null;
	try {
		const name = args.author.nickname ? args.author.nickname : args.author.username;
		embed = {
			color: config.tag_roles[args.group_type][1],
			thumbnail: {
				url: args.author.user.avatarURL()
			},
			title: args.description,
			description: `Posted by <@${args.author.id}>`,
			timestamp: new Date(),
			footer: {
				text: channel.id === config.master_channel ? 'React with ❌ to delete this message' : 'Head over to the iLoveBacons server to make your own posts!'
			}
		}
	} catch(e) {
		throw 'LFGBot/commands/lfg.js:5 There was an error creating the embed.' + ('\n' + e).replace(/\n/g, '\n\t');
	}
	try {
		let message = await channel.send({embed: embed, content: invite});
		if (channel.id === config.master_channel) {
			await message.react('❌');
		}
		return message;
	} catch(e) {
		throw `LFGBot/commands/lfg.js:24 There was an error sending to ${channel.name} (${channel.id} in ${channel.guild.name}) ${('\n' + e).replace(/\n/g, '\n\t')}`;
	}
}

module.exports = {
	name: 'lfg',
	description: 'create a group invitation for anykind of content',
	async execute(msg, args) {
		const guild = msg.client.guilds.resolve(config.master_guild);
		const voice = guild.voiceStates.resolve(msg.author.id);
		const priorPost = await utility.searchChannel(msg.client, config.master_channel, msg.author.id);

		if (priorPost) {
			// tell user that only one post is allowed at a time
			msg.author.send('Only one post per user is permitted.');
			return;
		}

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
		// preparing info for the embed
		const embed_args = { 
			author: guild.members.resolve(msg.author.id),
			description: args.join(' '),
			group_type: group_type
		}
		const channel = guild.channels.resolve(voice.channel);
		// create invite to the voice channel
		let invite = null;
		try {
			invite = await channel.createInvite();
		} catch (e) {
			throw 'LFGBot/commands/lfg.js:62 There was an error creating the invite.' + ('\n' + e).replace(/\n/g, '\n\t');
		}
		// send post to the master channel
		try {
			let master_message = await postInvite(msg.client.channels.resolve(config.master_channel), embed_args, invite);

		} catch (e) {
			throw 'LFGBot/commands/lfg.js:67 There was an error sending the embed.' + ('\n' + e).replace(/\n/g, '\n\t');
		}
		// if master was posted to, then post to broadcast channels
		try {
			// build array of promises to post embed in each broadcast channel
			let send_promises = config.broadcast_channels.map(id => postInvite(msg.client.channels.resolve(id), embed_args, invite))
			// allow all promises to settle
			let results = await Promise.allSettled(send_promises)
			// look through completed promises for rejections
			let rejections = []
			results.forEach((p, i, results) => {
				if (p.status === 'rejected') rejections.unshift(p.reason);
			});
			if (rejections.length > 0) throw rejections.join('\n');
		// failures to send to broadcast channels aren't critical
		} catch (e) {
			console.error('Some messages could not be sent: \n' + e)
		}
	}
}
