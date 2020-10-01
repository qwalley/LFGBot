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
