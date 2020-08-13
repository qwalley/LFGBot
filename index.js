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

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  // post a welcome message in each of hte assigned channels
  for (const id of config.channels) {
    bot.channels.fetch(id)
      .then(channel => { channel.send(`Hi, I'm ${config.name}`) })
      .catch(console.error);
  }

});

bot.on('message', msg => {
  // check that message is on the correct channel
  if (!config.channels.includes(msg.channel.id)) return;
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
