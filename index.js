require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const config = require('./config.json');

// save mapping of command name to command execute function in bot object
Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

const parseEmbedUser = (embed) => {
  const description = embed.description.split(/ +/);
  return description[1].slice(2, -1)

}
const enterChannel = (id, embed) => {
  return bot.channels.fetch(id)
    .then(async channel => {
      // fetch and delete old messages
      const message_bulk = await channel.messages.fetch({limit : 100});
      channel.bulkDelete(message_bulk);
      // post welcome message with instructions
      channel.send({embed: embed});
    });
}
const master_embed = {
  title: 'Hi I\'m LFG BOT!',
  description: 'join <@364219729491263498> in sfkjslkdfjls'
}
const broadcast_embed = {
  title: 'Hi I\'m LFG BOT!',
  description: 'this is a broadcast_embed'
}
bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  // create an array of send promises for each broadcast channel
  channel_promises = config.broadcast_channels.map(id => enterChannel(id, broadcast_embed));
  // add send promise for master channel
  channel_promises.push(enterChannel(config.master_channel, master_embed));
  // wait for all promises to resolve
  Promise.allSettled(channel_promises).catch(console.error)
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
  
  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});

bot.on('messageReactionAdd', (reaction, user) => {
  const msg = reaction.message;
  // check that message is on the correct channel
  if (!config.channels.includes(msg.channel.id)) return;
  // ignore this bot's reactions
  if (bot.user.id === user.id) return;
  // check that user reacting is the user who posted the thing
  if (user.id !== parseEmbedMessage(msg.embeds[0].toJSON())) return;
});
