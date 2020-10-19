const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const config = require('./config.json');
const utility = require('./utility.js')

// save mapping of command name to command execute function in bot object
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = config.token;

bot.login(TOKEN);

const master_embed = config.embeds.master;
const broadcast_embed = config.embeds.broadcast;

const enterChannel = async (id, embed) => {
  let channel = null;
  try {
    channel = await bot.channels.fetch(id);
  } catch (error) {
    throw "Error: Could not fetch channel: " + id + ('\n' + error).replace(/\n/g, '\n\t');
  }
  try {
    const message_bulk = await channel.messages.fetch({ limit: 100 });
    channel.bulkDelete(message_bulk);
  } catch (error) {
      console.error('Warning: Could not bulkDelete messages from channel: ' + id + ('\n' + error).replace(/\n/g, '\n\t'));
  }
  try {
    return await channel.send({embed: embed});
  } catch (error) {
    throw "Error: Could not send welcome message to channel: " + id + ('\n' + error).replace(/\n/g, '\n\t');
  }
}

const delayedDelete = async (message, userID, channelID) => {
  const voiceState = message.guild.voiceStates.resolve(userID);
  // if the user has returned to the correct channel during the three minutes, do nothing
  console.log('checking channel.')
  if (voiceState.channelID === channelID) return;
  console.log('not in channel, deleting now.')
  // if user is not in the right channel, then delete message, and all it's clones
  try {
    await message.delete();
    // will need to look through mirror channels and delete those messages
    let results = await utility.deleteAllChannels(bot, config.broadcast_channels, userID)
    // look through completed promises for rejections
      let rejections = []
      // concatenate all the rejection messages
      results.forEach((p, i, results) => {
        if (p.status === 'rejected') rejections.unshift(p.reason);
      });
      if (rejections.length > 0) throw rejections.join('\n');
      return results;
  } catch (error) {
      console.error('LFGBot/index.js:44 There was an error deleting messages.' + ('\n' + error).replace(/\n/g, '\n\t'));
  }
}

bot.on('ready', async () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  try {
    // send welcome message to master channel
    await enterChannel(config.master_channel, master_embed);
  } catch (error) {
    throw 'Fatal Error: Could not join Master Channel' + ('\n' + error).replace(/\n/g, '\n\t');
  }
  try {
    // create an array of send promises for each broadcast channel
    channel_promises = config.broadcast_channels.map(id => enterChannel(id, broadcast_embed));
    // wait for all promises to resolve
    results = await Promise.allSettled(channel_promises);
    // look for rejections
    let rejections = []
      results.forEach((p, i, results) => {
        if (p.status === 'rejected') rejections.unshift(p.reason);
      });
      if (rejections.length > 0) throw rejections.join('\n');
  } catch (error) {
    console.error(error);
  }
});

bot.on('message', async msg => {
  // if master channel is configured
  if (config.master_channel) {
    // check that message is on the correct channel 
    if (config.master_channel !== msg.channel.id) return;
  }
  // if author is not this bot, delete message to reduce cluter
  if (bot.user.id === msg.author.id) {
    return;
  }
  else {
    await msg.delete();
  }
  // assume first word is intended as a command
  const args = msg.content.split(/ +/);
  command = args.shift().toLowerCase();
  // check that command has correct prefix
  regex = new RegExp('^' + config.prefix);
  if (!regex.test(command)) return;
  // check that bot has command
  command = command.replace(regex, '');
  if (!bot.commands.has(command)) return;

  console.info(`Called command: ${command}`);
  // execute the command, all commands should return promises
  try {
    await bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});

bot.on('messageReactionAdd', async (reaction, user) => {
  try {
    const msg = reaction.message;
    // check that message is on the correct channel
    if (config.master_channel !== msg.channel.id) return;
    // ignore this bot's reactions
    if (bot.user.id === user.id) return;
    // check that user reacting is the user who posted the thing
    if (user.id !== utility.parseEmbedUser(msg)) return;
    await msg.delete()
    // will need to look through mirror channels and delete those messages
    let results = await utility.deleteAllChannels(bot, config.broadcast_channels, user.id)
    // look through completed promises for rejections
    let rejections = []
    results.forEach((p, i, results) => {
      if (p.status === 'rejected') rejections.unshift(p.reason);
    });
    if (rejections.length > 0) throw rejections.join('\n');
  } catch (error) {
    console.error(error);
  }
});

bot.on('voiceStateUpdate', async (oldState, newState) => {
  // check that the poster of a LFG has not left the voice channel advertised in the post
  // is this on the master guild?
  if (oldState.guild.id !== config.master_guild) return;
  // ignore updates that aren't changes in voice channel
  if (oldState.channelID === newState.channelID) return;
  try {
    // check if the player has a LFG post active
    message = await utility.searchChannel(bot, config.master_channel, oldState.id)
    if (!message) return;
    // old channel matches with channel invite in the LFG post then set a timeout to delete the post
    const oldChannel = oldState.guild.channels.resolve(oldState.channelID);
    const msgInvite = message.content.split(' ')[2]
    const channelInvites = await oldChannel.fetchInvites();
    const matchedInvites = channelInvites.filter(invite => invite.url === msgInvite);
    // if the user has not left the channel in the LFG Post, there's nothing to do
    if (matchedInvites.size === 0) return;
    // otherwise set timeout to check again in three minutes
    bot.setTimeout(delayedDelete, config.leave_delay, message, oldState.id, oldState.channelID);
  } catch (error) {
    console.error(error);
  }

});