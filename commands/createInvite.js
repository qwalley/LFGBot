const config = require('../config.json');

module.exports = (args) => {
	const msg = args.msg;
	const guild = msg.client.guilds.resolve(config.master);
	const voice = guild.voiceStates.resolve(msg.author.id);
	
	// delete message to keep channel clean
	msg.delete();

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
	// plaintext message is a placeholder, should send a "pretty" embed
	msg.channel.send(description + `\n<@&${config.tag_roles[args.role]}> <@${msg.author.id}>`)
		.then(message => message.react('❌'))
}