const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create a customizable embed')
        .addStringOption(option => option.setName('title').setDescription('Embed title').setRequired(false))
        .addStringOption(option => option.setName('description').setDescription('Embed description (use / for newline)').setRequired(false))
        .addStringOption(option => option.setName('title_url').setDescription('Title URL').setRequired(false))
        .addStringOption(option => option.setName('colour').setDescription('Embed colour (Hex code)').setRequired(false))
        .addStringOption(option => option.setName('footer_text').setDescription('Footer text').setRequired(false))
        .addStringOption(option => option.setName('footer_icon_url').setDescription('Footer icon URL').setRequired(false))
        .addBooleanOption(option => option.setName('timestamp').setDescription('Add a timestamp').setRequired(false))
        .addStringOption(option => option.setName('image_urls').setDescription('Image URLs (comma separated, max 4)').setRequired(false))
        .addStringOption(option => option.setName('thumbnail_url').setDescription('Thumbnail URL').setRequired(false))
        .addStringOption(option => option.setName('author_name').setDescription('Author name').setRequired(false))
        .addStringOption(option => option.setName('author_url').setDescription('Author URL').setRequired(false))
        .addStringOption(option => option.setName('author_profile').setDescription('Author profile picture URL').setRequired(false))
        .addStringOption(option => option.setName('field_name_1').setDescription('Field 1 Name').setRequired(false))
        .addStringOption(option => option.setName('field_value_1').setDescription('Field 1 Value (use / for newline)').setRequired(false))
        .addStringOption(option => option.setName('field_name_2').setDescription('Field 2 Name').setRequired(false))
        .addStringOption(option => option.setName('field_value_2').setDescription('Field 2 Value (use / for newline)').setRequired(false))
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'embed') return;

    const parseNewLines = (text) => text ? text.replace(/([^/]|^)\/(?!\/)/g, '$1\n').replace(/\/\//g, '/') : null;

    const title = interaction.options.getString('title') || null;
    const description = parseNewLines(interaction.options.getString('description'));
    const titleUrl = interaction.options.getString('title_url') || null;
    const color = interaction.options.getString('colour') || '#0099ff';
    const footerText = interaction.options.getString('footer_text') || null;
    const footerIconUrl = interaction.options.getString('footer_icon_url') || null;
    const addTimestamp = interaction.options.getBoolean('timestamp') || false;
    const imageUrls = interaction.options.getString('image_urls')?.split(',').map(url => url.trim()) || [];
    const thumbnailUrl = interaction.options.getString('thumbnail_url') || null;
    const authorName = interaction.options.getString('author_name') || null;
    const authorUrl = interaction.options.getString('author_url') || null;
    const authorProfile = interaction.options.getString('author_profile') || null;

    const fields = [];
    for (let i = 1; i <= 2; i++) {
        const fieldName = interaction.options.getString(`field_name_${i}`);
        const fieldValue = parseNewLines(interaction.options.getString(`field_value_${i}`));
        if (fieldName && fieldValue) {
            fields.push({ name: fieldName, value: fieldValue, inline: false });
        }
    }

    const embed = {
        color: color.startsWith('#') ? parseInt(color.slice(1), 16) : 0x0099ff,
        title: title || null,
        description: description || null,
        url: titleUrl || null,
        footer: footerText ? { text: footerText, icon_url: footerIconUrl || null } : null,
        author: authorName ? { name: authorName, url: authorUrl || null, icon_url: authorProfile || null } : null,
        thumbnail: thumbnailUrl ? { url: thumbnailUrl } : null,
        image: imageUrls.length > 0 ? { url: imageUrls[0] } : null,
        fields: fields.length > 0 ? fields : [],
    };

    if (addTimestamp) {
        embed.timestamp = new Date();
    }

    if (!title && !description) {
        return interaction.reply({ content: 'You must provide at least a title or a description!', ephemeral: true });
    }

    await interaction.reply({ embeds: [embed] });
});

client.login(process.env.DISCORD_TOKEN);
