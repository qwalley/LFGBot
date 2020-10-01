# LFGBot
This is a Discord bot that will maintain a clean Looking For Group channel in your gaming Discord server. It was designed for the game Albion Online, but is suited for any multiplayer game.

## How does it work?
The bot will listen a specific text channel, and accept commands in the form `!lfg [group_type] [content_description]`. 
  * The `group_type` can be linked to a mentionable role on your server so that players can be pinged for content that they're interested in.
  * The `content_description` will be the headline of the embed.
  * The `!lfg` command will only be accepted if the host user is in a voice channel on the same server as the master channel.
  * Only one post is permitted per user, any posts made after the first will be ignored.
  
Any messages in the channel will be deleted, and those with a valid command are replaced with an embed containing all the information needed to join the group, and an invitation to the host's voice channel.
  
## How is this better than an unmanaged channel?
The bot by it's nature will filter out spam, and meaningless messages. 

Additionally, when the host leaves their voice channel the post will be deleted if they do not return within 3 minutes. This ensures that all posts are current, giving your members a list of all the available content at a glance.

The bot can be configured to broadcast the embeds to channels on different servers, which can help improve the visibility of your posts.

## How do I add it to my server?
The hard way!

1. Get the code
  * You need a server with Node.js installed
  * Clone this repository into a folder somewhere on your server using the command `git clone https://github.com/qwalley/LFGBot.git`
  * Navigate to the LFGBot directory and install the bot's dependencies using the command `npm install`
2. Register your bot
  * Go to the [Discord Developer Portal](https://discord.com/login?redirect_to=%2Fdevelopers) and log in using your usual discord account
  * Select the `Applications` and click on `New Application` in the top right of the screen.
  * Enter the name of your new application and click `create`
  * Click on the `Bot` tab on the left-hand side, an then choose `Add Bot` in the top right.
  * Click on the `OAuth2` tab on the left-hand side, and then choose the `bot` option from the list of scopes.
  * Copy/paste the url into a broswer and replace the permission value with `76880` before hitting enter. The url should look like this: `https://discord.com/api/oauth2/authorize?client_id=your_client_id&permissions=76880&scope=bot`
  * If you are the owner of a Discord server you should be prompted to select which server you want to add the bot to.
3. Configuring the bot
  * On you server, open `LFGBot/config.json` in a text editor
  * todo
