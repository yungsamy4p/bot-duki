const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');
const { agregarWarning } = require('../../utils/warningsHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Objetivo').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Motivo').setRequired(true)),

    async execute(interaction) {
        if (!tienePermiso(interaction, 'warn')) return interaction.reply({ content: '⛔ Sin autorización.', ephemeral: true });

        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon');

        const idWarn = agregarWarning(interaction.guild.id, usuario.id, interaction.user.tag, razon);

        // Intentar enviar MD al usuario
        try {
            await usuario.send(`⚠️ Has recibido una advertencia en **${interaction.guild.name}**.\n**Razón:** ${razon}`);
        } catch (e) { /* DM cerrado */ }

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ Advertencia Registrada')
            .setDescription(`**Usuario:** ${usuario.tag}\n**ID Warn:** \`${idWarn}\`\n**Razón:** ${razon}`)
            .setFooter({ text: 'Sistema de Disciplina DUKI' });

        await interaction.reply({ embeds: [embed] });
    },
};