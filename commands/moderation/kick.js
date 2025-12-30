const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('Objetivo').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Motivo')),

    async execute(interaction) {
        if (!tienePermiso(interaction, 'kick')) return interaction.reply({ content: '⛔ Sin autorización.', ephemeral: true });

        const usuario = interaction.options.getUser('usuario');
        const miembro = interaction.guild.members.cache.get(usuario.id);
        const razon = interaction.options.getString('razon') || 'Sin razón';

        if (!miembro) return interaction.reply({ content: 'Usuario no encontrado.', ephemeral: true });
        if (!miembro.kickable) return interaction.reply({ content: '❌ Objetivo blindado (rol superior).', ephemeral: true });

        await miembro.kick(razon);
        
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // Naranja
            .setTitle('🥾 Usuario Expulsado')
            .setDescription(`**Objetivo:** ${usuario.tag}\n**Razón:** ${razon}`);

        await interaction.reply({ embeds: [embed] });
    },
};