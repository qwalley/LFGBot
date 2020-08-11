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
  console.info(`Hello I'm ${config.name}`);
  // post a welcome message in each of hte assigned channels
  for (const id of config.channels) {
    bot.channels.fetch(id)
      .then(channel => { channel.send(`Hi, I'm ${config.name}`) })
      .catch(console.error);
  }

});

bot.on('message', msg => {
  // assume first word is intended as a command
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) return;

  console.info(`Called command: ${command}`);
  
  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
