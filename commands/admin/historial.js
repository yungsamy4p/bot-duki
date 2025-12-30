const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historial')
        .setDescription('Muestra las últimas licencias canjeadas en el servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {

            const licenses = await License.find({ isClaimed: true })
                .sort({ claimedAt: -1 })
                .limit(15);

            if (licenses.length === 0) {
                return interaction.editReply('<:84918explorer:1440784798510485545> **Base de datos vacía:** Aún no se han canjeado licencias.');
            }


            const historialTexto = licenses.map((lic, index) => {

                const fecha = lic.claimedAt ? `<t:${Math.floor(lic.claimedAt.getTime() / 1000)}:d>` : 'Desconocida';
                return `<:84918explorer:1440784798510485545> **${lic.product}**\n<:76049user11:1440784770106785992> Usuario: <@${lic.claimedBy}>\n<:809011form:1440796832799264908> Key: \`...${lic.key.slice(-4)}\` | <:47836calendar:1440797793966100530> ${fecha}`;
            }).join('\n\n');

            const embed = new EmbedBuilder()
                .setTitle('<:809011form:1440796832799264908> Registro de Licencias Activadas')
                .setDescription(historialTexto)
                .setColor(0x050505)
                .setFooter({ text: 'Mostrando las últimas 15 transacciones' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al recuperar el historial.');
        }
    },
};