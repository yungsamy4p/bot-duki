const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('un-timeout')
        .setDescription('Retira el aislamiento a un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Objetivo').setRequired(true)),

    async execute(interaction) {
        if (!tienePermiso(interaction, 'un-timeout') && !tienePermiso(interaction, 'un-mute')) 
            return interaction.reply({ content: '⛔ Sin autorización.', ephemeral: true });

        const usuario = interaction.options.getUser('usuario');
        const miembro = interaction.guild.members.cache.get(usuario.id);

        if (!miembro.isCommunicationDisabled()) return interaction.reply({ content: '⚠️ Este usuario no está silenciado.', ephemeral: true });

        await miembro.timeout(null); // Quitar timeout

        const embed = new EmbedBuilder()
            .setColor('#00FF00') // Verde
            .setTitle('🗣️ Usuario Liberado')
            .setDescription(`Se ha retirado el silencio a **${usuario.tag}**.`);

        await interaction.reply({ embeds: [embed] });
    },
};