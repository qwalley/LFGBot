exports.parseEmbedUser = (message) => {
	// check that the message has an embed
 	if (message.embeds.length === 0) return null;
  	const embed = message.embeds[0].toJSON();
  	const description = embed.description.split(/ +/);
  	return description[6].slice(2, -1)
  	// return description[5].slice(2, -1)

}

exports.searchChannel = async (bot, channelID, userID) => {
  	try {
	  	const channel = bot.channels.resolve(channelID);
	  	const message_bulk = await channel.messages.fetch({ limit: 100 });
	  	return message_bulk.find(message => exports.parseEmbedUser(message) === userID);
  	} catch (error) {
  		throw 'utility.js: searchChannel() There was an error searching channel: ' + channelID + ('\n' + error).replace(/\n/g, '\n\t');
  	}
}

exports.deleteAllChannels = async (bot, channelIDs, userID) => {
	try {
		let promises = await channelIDs.map(async id => {
			let message = await exports.searchChannel(bot, id, userID);
			if (!message) return null;
			return message.delete();
		});
		// remove nulls
		promises = promises.filter(p => p);
		return await Promise.allSettled(promises);
	} catch (error) {
  		throw 'utility.js: deleteAllChannels() There was an error deleting messages: ' + ('\n' + error).replace(/\n/g, '\n\t');
	}
}