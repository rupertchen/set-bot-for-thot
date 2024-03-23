const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poke')
		.setDescription('Manually trigger deletion of old messages'),
	async execute(interaction, client) {
		client.channels.fetch(interaction.channelId)
			.then(channel => deleteOldMessages(channel))
			.catch(console.error);
		await interaction.reply('Manually triggered deletion of old messages');
	},
};

function deleteOldMessages(channel) {
	console.debug('deletOldMessages');
	deleteOldMessagesBefore(channel, null)
		.catch(console.error);
}

function deleteOldMessagesBefore(channel, messageId) {
	console.debug(`deleteOldMessageBefore ${messageId}`);
	// The Bulk Delete Messages API accepts a maximum of 100 messages to
	// delete.
	//
	// See: https://discord.com/developers/docs/resources/channel#bulk-delete-messages
	return channel.messages.fetch({limit: 100, cache: false, before: messageId})
		.then(messages => {
			console.debug(`fetched ${messages.size} messages`);
			if (messages.size == 0) {
				return null;
			}

			const horizon = Date.now() - (1 * 60 * 1000);
			const candidates = messages.filter(m => m.createdTimestamp < horizon);
			console.debug(`filtered to ${candidates.size} messages`);
			channel.bulkDelete(candidates, true)
				.then(messages => console.debug(`Bulk deleted ${messages.size} messages`))
				.catch(console.error);

			const oldestMsg = messages.reduce(olderMessage);
			// If this message is too old to delete, then there's
			// no reason to continue fetching messages; they will
			// all be too old to delete.
			if (isTooOldToDelete(oldestMsg)) {
				return null;
			}

			if (oldestMsg.id != null) {
				deleteOldMessagesBefore(channel, oldestMsg.id);
			}
		});
}

function isTooOldToDelete(msg) {
	// Discord won't allow automated deletion of messages older than two
	// weeks.
	const age = Date.now() - msg.createdTimestamp;
	return age > (14 * 24 * 60 * 60 * 1000);
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
