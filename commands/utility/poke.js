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
		    channel.send(`DEBUG: found the channel, ${channel.name}`)
		    	.then(message => console.log(`Sent message: ${message.content}`))
		        .catch(console.error);

		    // Filter messages
		    const horizon = Date.now() - (1 * 60 * 1000);
		    const isTooOld = m => {
			    return m.createdTimestamp < horizon;
		    };

		    // Extract IDs
		    const oldMessages = channel.messages.fetch()
		        .then(messages => messages.filter(isTooOld))
		        .then(messages => {
		            channel.send(`DEBUG: found message(s) to delete, ${messages.size}`);
			    const report = messages.map(x => {
				    return {id: x.id, ts: x.createdTimestamp};
			    });
			    console.log('Deleting messages:', report);
			    //channel.bulkDelete(messages);
		    })

		    findLatestMessage(channel)
		    	.then(msg => console.log("Latest message", {id: msg.id, ts: msg.createdTimestamp}));
	    })
	    .catch(console.error);
	await interaction.reply(`Searching for oldest message in ${interaction.channelId}`);
    },
};

function findLatestMessage(channel) {
	return findLatestMessageAfter(channel, null);
}

function findLatestMessageAfter(channel, messageId) {
	return channel.messages.fetch({after: messageId})
		.then(messages => messages.reduce((acc, curr) => {
			return (acc == null || curr.createdTimestamp >= acc.createdTimestamp)
				? curr
				: acc;
		}, null))
		.then(m => {
			if (m == null) {
				return null;
			}
			return findLatestMessageAfter(channel, m.id)
				.then(m2 => m2 == null ? m : findLatestMessageAfter(channel, m2.id));
		});
}
