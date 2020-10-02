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

### 1. Get the code
  - [ ] You need a server with Node.js installed
  - [ ] Clone this repository into a folder somewhere on your server using the command `git clone https://github.com/qwalley/LFGBot.git`
  - [ ] Navigate to the LFGBot directory and install the bot's dependencies using the command `npm install`
### 2. Register your bot
  - [ ] Go to the [Discord Developer Portal](https://discord.com/login?redirect_to=%2Fdevelopers) and log in using your usual discord account
  - [ ] Select the `Applications` and click on `New Application` in the top right of the screen.
  - [ ] Enter the name of your new application and click `create`
  - [ ] Click on the `Bot` tab on the left-hand side, an then choose `Add Bot` in the top right.
  - [ ] Click on the `OAuth2` tab on the left-hand side, and then choose the `bot` option from the list of scopes.
  - [ ] Copy/paste the url into a broswer and replace the permission value with `76880` before hitting enter. The url should look like this:           
  > `https://discord.com/api/oauth2/authorize?client_id=your_client_id&permissions=76880&scope=bot`
  - [ ] If you are the owner of a Discord server you should be prompted to select which server you want to add the bot to.
### 3. Configuring the bot
  - [ ] Click on the `Bot` tab on the left-hand side, then click `click to reveal token` beside the bot's icon. Copy the token, and keep it private.
  - [ ] On you server, open `LFGBot/sample_config.json` in a text editor. paste your bot's token into the `"token" = ""` field.
  - [ ] Rename `sample_config.json` to `config.json`. Now in the command line type `node index.js` to start the bot.
  - [ ] Type `!guilds` and `!roles` into a text channel in your discord to get the channel IDs and role IDs to fill in the other values of `config.json`. Once a ChannelID is assigned to the `master_channel` value, the bot will only accept commands in that specific channel.
  - [ ] The `!lfg` command will not work until `master_channel` and `master_guild` are set.
Property | Required | Default | Description
---------|----------|---------|------------
name | no | "LFGBot" | doesn't actually do anything
prefix | yes | "!" | Used to parse commands, characters like `!`, `$`, `#` are ideal
token | yes | none | Used by the bot to connect to your server
broadcast_channels | no | none | An optional array of channelIDs to send copies of the LFG posts to
master_channel | yes | none | The channelID of a text channel. This will be where commands are entered, and posts are made
master_guild | yes | none | the guildID of a Discord server. The bot will use this to track voice activity, the master_channel should belong to the master_guild
tag_roles | yes |  | A key:value pair. The key sets valid arguments for the `!lfg` command
tag_roles[key][0] | no |  | The roleID of a mentionable role in `master_guild`, if set the bot will ping users who have this role when a post is made
tag_roles[key][1] | no |  | A hex code for the colour assigned the embed for posts made with this role
tag_roles[key][2] | no |  | An emoji to spice the posts

  *more info required on setting up config.json*
