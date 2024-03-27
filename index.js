require('dotenv').config()
console.log(process.env)


const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// TODO: All this command related stuff is unused.  It comes from the
// Discord.js tutorial.  Perhaps remove it all?
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const botConfig = {
	// SetSailForFail, #thot-ish
	'1219259318835220542': {
		'schedule': '* * * * *',
		'maxAge': 3 * 60 * 1000,
		'runOnClientReady': true,
	},
	// café frites olé, #thoughty-shit
	'1207547969608486932': {
		'schedule': '0 * * * *',
		'maxAge': 48 * 60 * 60 * 1000,
		'runOnClientReady': true,
	},
	// café frites olé, #thotty-shit
	'1207547936439934996': {
		'schedule': '0 * * * *',
		'maxAge': 48 * 60 * 60 * 1000,
		'runOnClientReady': true,
	},
};

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error whlie executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}`);

	for (const channelId in botConfig) {
		const channelConfig = botConfig[channelId];
		console.log(`Schedule prune on ${channelId}`, channelConfig);

		const fn = () => {
			console.log(`Running scheduled prune on ${channelId}`);
			deleteOldMessages(channelId, channelConfig.maxAge);
		};

		cron.schedule(channelConfig.schedule, fn);

		if (channelConfig.runOnClientReady) {
			fn.apply();
		}
	}
});

client.login(token);

function deleteOldMessages(channelId, maxAge) {
	console.debug('deleteOldMessages', { channelId, maxAge });
	client.channels
		.fetch(channelId)
		.then(channel => deleteOldMessagesBefore(channel, maxAge, null))
		.catch(console.error);
}

function deleteOldMessagesBefore(channel, maxAge, messageId) {
	console.debug('deleteOldMessageBefore', { maxAge, messageId });
	// The Bulk Delete Messages API accepts a maximum of 100 messages to
	// delete.
	//
	// See: https://discord.com/developers/docs/resources/channel#bulk-delete-messages
	return channel.messages.fetch({ limit: 100, cache: false, before: messageId })
		.then(messages => {
			console.debug(`fetched ${messages.size} messages`);
			if (messages.size == 0) {
				return null;
			}

			const horizon = Date.now() - maxAge;
			const candidates = messages.filter(m => m.createdTimestamp < horizon);
			console.debug(`filtered to ${candidates.size} messages`);
			channel.bulkDelete(candidates, true)
				.then(deletedMsgs => console.debug(`Bulk deleted ${deletedMsgs.size} messages`))
				.catch(console.error);

			const oldestMsg = messages.reduce(olderMessage);
			// If this message is too old to delete, then there is
			// no reason to continue fetching messages; they will
			// all be too old to delete.
			if (isTooOldToDelete(oldestMsg)) {
				return null;
			}

			if (oldestMsg.id != null) {
				deleteOldMessagesBefore(channel, maxAge, oldestMsg.id);
			}
		});
}

function isTooOldToDelete(msg) {
	// Discord won't allow automated deletion of messages older than two
	// weeks.
	const age = Date.now() - msg.createdTimestamp;
	// TODO: Is this available as a constant from Discord.js in v14?
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

	return (m1.id < m2.id) ? m1 : m2;
}
