const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
	.setDescription('Replies with some debugging info'),
    async execute(interaction, client) {
	console.log(`Searching for oldest message in ${interaction.channelId}`);
	client.channels.fetch(interaction.channelId)
	    .then(channel => {
		    // Fetch channel
		    console.log(channel);
		    channel.send(`DEBUG: found the channel, ${channel.name}`)
		    	.then(message => console.log(`Sent message: ${message.content}`))
		        .catch(console.error);

		    // Filter messages
		    const horizon = Date.now() - (1 * 60 * 1000);
		    const filter = m => {
			    console.log(`created at ${new Date(m.createdTimestamp)}, filter message ${m.content}`);
			    return m.createdTimestamp < horizon;
		    };

		    // Extract IDs
		    const msgIds = channel.messages.fetch()
		        .then(messages => messages.filter(filter))
		    	.then(messages => {
			    console.log(`Received ${messages.size} messages`);
			    channel.send(`DEBUG: fetched ${messages.size} messages`);
			    
			    messages.forEach((val, key, map) => {
				    console.log(`m[${key}] = createdTimestamp:${val.createdTimestamp}, deletable:${val.deletable}`);
			    });
				console.log('message IDs', messages.keys());
			    return messages.keys();
			})
		    	.catch(console.error);

		    msgIds.then(ids => {
			    console.log(ids);
			    for (const id of ids) {
				    console.log(`Delete message ${id}`);
				    channel.messages.delete(id);
			    }
		    });

	    })
	    .catch(console.error);
	await interaction.reply(`Searching for oldest message in ${interaction.channelId}`);
    },
};
