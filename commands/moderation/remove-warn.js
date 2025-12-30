const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');
const { borrarWarning } = require('../../utils/warningsHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-warn')
        .setDescription('Elimina una advertencia específica.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(option => option.setName('id_warn').setDescription('ID de la advertencia').setRequired(true)),

    async execute(interaction) {
        if (!tienePermiso(interaction, 'remove-warn') && !tienePermiso(interaction, 'warn')) 
            return interaction.reply({ content: '⛔ Sin autorización.', ephemeral: true });

        const usuario = interaction.options.getUser('usuario');
        const idWarn = interaction.options.getString('id_warn');

        const exito = borrarWarning(interaction.guild.id, usuario.id, idWarn);

        if (exito) {
            await interaction.reply({ content: `✅ Advertencia \`${idWarn}\` eliminada del historial de **${usuario.tag}**.` });
        } else {
            await interaction.reply({ content: `❌ No encontré ninguna advertencia con ID \`${idWarn}\` para ese usuario.`, ephemeral: true });
        }
    },
};