const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');

// Función auxiliar simple para convertir texto a milisegundos
function parseDuration(durationStr) {
    const unit = durationStr.slice(-1);
    const value = parseInt(durationStr.slice(0, -1));
    if (isNaN(value)) return null;
    
    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aisla temporalmente a un usuario (Mute moderno).')
        .addUserOption(option => option.setName('usuario').setDescription('Objetivo').setRequired(true))
        .addStringOption(option => option.setName('tiempo').setDescription('Duración (ej: 10m, 1h, 1d)').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Motivo')),

    async execute(interaction) {
        if (!tienePermiso(interaction, 'timeout') && !tienePermiso(interaction, 'mute')) 
            return interaction.reply({ content: '⛔ Sin autorización.', ephemeral: true });

        const usuario = interaction.options.getUser('usuario');
        const tiempoStr = interaction.options.getString('tiempo');
        const razon = interaction.options.getString('razon') || 'Sin razón';
        const miembro = interaction.guild.members.cache.get(usuario.id);

        const ms = parseDuration(tiempoStr);
        if (!ms || ms > 2419200000) return interaction.reply({ content: '❌ Formato de tiempo inválido o superior a 28 días (límite de Discord). Usa: 10m, 1h, 1d.', ephemeral: true });
        
        if (!miembro.moderatable) return interaction.reply({ content: '❌ No puedo aislar a este usuario.', ephemeral: true });

        await miembro.timeout(ms, razon);

        const embed = new EmbedBuilder()
            .setColor('#FFFF00') // Amarillo
            .setTitle('🤐 Usuario Silenciado (Timeout)')
            .setDescription(`**Objetivo:** ${usuario.tag}\n**Duración:** ${tiempoStr}\n**Razón:** ${razon}`);

        await interaction.reply({ embeds: [embed] });
    },
};