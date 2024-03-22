const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poke')
	.setDescription('Replies with some debugging info'),
    async execute(interaction, client) {
	client.channels.fetch(interaction.channelId)
	    .then(channel => {
		    // Fetch channel
		    channel.send(`DEBUG: found the channel, ${channel.name}`)
		        .catch(console.error);

		    deleteOldMessages(channel);
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

function deleteOldMessages(channel) {
	console.log('deletOldMessages');
	deleteOldMessagesBefore(channel, null)
		.then(id => {
			if (id != null) {
				deleteOldMessagesBefore(channel, id);
			}
		});
}

function deleteOldMessagesBefore(channel, messageId) {
	console.log(`deleteOldMessageBefore ${messageId}`);
	return channel.messages.fetch({limit: 1, before: messageId})
		.then(messages => {
			if (messages.size == 0) {
				return null;
			}

			const horizon = Date.now() - (1 * 60 * 1000);
			const candidates = messages.filter(m => m.createdTimestamp < horizon);
			channel.bulkDelete(candidates);

			return messages.reduce(olderMessage).id;
		});
}

function olderMessage(m1, m2) {
	const stamp1 = m1.createdTimestamp;
	const stamp2 = m2.createdTimestamp;

	if (stamp1 < stamp2) {
		return m1;
	}
	if (stamp2 < stamp1) {
		return m2;
	}

	const id1 = m1.id;
	const id2 = m2.id;

	return (m1.id < m2.id) ? m1 : m2;
}
