require('dotenv').config();
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

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

const master_embed = {
  title: 'Use this channel to post adds for your group content!',
  description: `
    You must be in a voice channel!\n
    Post your adds in the format:\n
    \`!lfg [famefarm|hellgate|gank] [description]\`
  `,
  fields: [
    {
      name: 'Example 1',
      value: '!lfg famefarm Need tank and 1 dps for T5 BBP random dungeons 900IP min'
    },
    {
      name: 'Example 2',
      value: '!lfg gank Gank group leaving from BBP HO | max 10 people | bring 1000IP or higher gank builds'
    },
    {
      name: 'Example 3',
      value: '!lfg hellgate Need partner for 2v2 HGs near Arthur\'s Rest, I can run curse or holy healer'
    }
  ]
}
const broadcast_embed = {
  title: 'This is a broadcast channel for the iloveBacon LFG Bot!',
  description: `
    LFG posts that are made on the iLoveBacons server will be copied here.\n
    Clicking on the link in the descriptions will let you join the group in a voice party!\n
    Head over to iLoveBacons to make your own LFG posts!
  `
}

const enterChannel = (id, embed) => {
  return bot.channels.fetch(id)
    .then(async channel => {
      try {
        // fetch and delete old messages
        const message_bulk = await channel.messages.fetch({ limit: 100 });
        channel.bulkDelete(message_bulk);
      } catch (e) {
        console.error(e)
      }
      // post welcome message with instructions
      channel.send({embed: embed}).catch(console.error)
    })
    .catch(console.error);
}

bot.on('ready', async () => {
  try {
    console.info(`Logged in as ${bot.user.tag}!`);
    // send welcome message to master channel
    await enterChannel(config.master_channel, master_embed);
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
  // check that message is on the correct channel
  if (config.master_channel !== msg.channel.id) return;
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
  try {
    // check if the player has a LFG post active
    message = await utility.searchChannel(bot, config.master_channel, oldState.id)
    if (!message) return;
    // compare the invite in the message to the new voice channel
    let newChannel = newState.guild.channels.resolve(newState.channelID);
    let invites = await newChannel.fetchInvites();
    const matchedInvites = invites.filter(invite => invite.url === message.content);
    // if the channel in the post matches the current channel, there's nothing to do
    if (matchedInvites.length > 0) return;
    // otherwise delete the post
    await message.delete();
    // will need to look through mirror channels and delete those messages
    let results = await utility.deleteAllChannels(bot, config.broadcast_channels, oldState.id)
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