const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');
const { obtenerWarnings } = require('../../utils/warningsHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn-list')
        .setDescription('Muestra el historial de advertencias de un usuario.')
        .addUserOption(option => 
            option.setName('usuario').setDescription('El usuario a investigar').setRequired(true)),

    async execute(interaction) {
        // Verificación de permisos: Se necesita 'warn-list' o 'warn' para ver el historial
        if (!tienePermiso(interaction, 'warn-list') && !tienePermiso(interaction, 'warn')) {
            return interaction.reply({ content: '⛔ Acceso denegado a los archivos clasificados.', ephemeral: true });
        }

        const usuario = interaction.options.getUser('usuario');
        const advertencias = obtenerWarnings(interaction.guild.id, usuario.id);

        // Si el sujeto está limpio
        if (!advertencias || advertencias.length === 0) {
            return interaction.reply({ 
                content: `✅ El expediente de **${usuario.tag}** está limpio. No se encontraron advertencias.`, 
                ephemeral: true 
            });
        }

        // Construcción del reporte
        const embed = new EmbedBuilder()
            .setColor('#3498DB') // Azul táctico
            .setTitle(`📂 Historial Disciplinario: ${usuario.tag}`)
            .setDescription(`Se encontraron **${advertencias.length}** registro(s).`)
            .setThumbnail(usuario.displayAvatarURL())
            .setTimestamp();

        // Añadir campos para cada advertencia (Límite de 25 campos en Discord, ojo con eso en el futuro)
        // Tomamos las últimas 10 para no saturar el mensaje si tiene muchas
        const ultimasWarnings = advertencias.slice(-10); 

        ultimasWarnings.forEach((warn, index) => {
            const fecha = new Date(warn.fecha).toLocaleDateString('es-ES');
            embed.addFields({
                name: `#${index + 1} | ID: ${warn.id} | ${fecha}`,
                value: `**Mod:** ${warn.mod}\n**Razón:** ${warn.razon}`,
                inline: false
            });
        });

        if (advertencias.length > 10) {
            embed.setFooter({ text: `Mostrando las últimas 10 de ${advertencias.length} advertencias totales.` });
        } else {
            embed.setFooter({ text: 'Sistema de Disciplina DUKI' });
        }

        await interaction.reply({ embeds: [embed] });
    },
};