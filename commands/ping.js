module.exports = {
	name: 'ping',
	description: 'sanity check.',
	execute(msg, args) {
		msg.reply('yes, I\'m here.');
	},
};