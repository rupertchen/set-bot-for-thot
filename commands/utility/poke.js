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

		    // Fetch messages
		    const filter = m => {
			    console.log(`filter message ${message.content}`);
			    return true;
		    };
		    return channel.awaitMessages({ filter, max: 5, time: 10_000, errors: ['time']})
		        .then(collected => console.log(collected.size))
		        .catch(collected => console.log(`After 10 s, only ${collected.size}`));
	    })
	    .catch(console.error);
	await interaction.reply(`Searching for oldest message in ${interaction.channelId}`);
    },
};
