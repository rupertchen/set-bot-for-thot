const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

const task = cron.schedule('* * * * *', () => {
	console.log('Running scheduled prune');
	pruneV0(client, '1219259318835220542');
});

function pruneV0(client, channelId) {
	client.channels
		.fetch(channelId)
		.then(pruneChannelV0);
}

function pruneChannelV0(channel) {
	channel.send(`DEBUG: prune channel ${channel.name}`)
		.catch(console.error);

	const horizon = Date.now() - (2 * 60 * 1000);
	const isTooOld = message => message.createdTimestamp < horizon;

	return channel.messages.fetch()
		.then(messages => messages.filter(isTooOld))
		.then(messages => {
			channel.send(`DEBUG: found message(s) to delete, ${messages.size}`);
			const report = messages.map(m => {
				return {
					id: m.id,
					ts: m.createdTimestamp
				};
			});
			console.log('Deleting messages', report);
			channel.bulkDelete(messages);
		});
}
