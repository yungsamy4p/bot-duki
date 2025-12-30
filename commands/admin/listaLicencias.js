const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lista-licencias')
        .setDescription('Muestra el inventario de licencias por páginas')
        .addIntegerOption(option => 
            option.setName('pagina')
                .setDescription('Número de página a consultar (Por defecto: 1)')
                .setMinValue(1)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });


        const itemsPorPagina = 15; 
        let page = interaction.options.getInteger('pagina') || 1;

        try {

            const totalLicencias = await License.countDocuments();
            const maxPages = Math.ceil(totalLicencias / itemsPorPagina);

            if (totalLicencias === 0) {
                return interaction.editReply('<:84918explorer:1440784798510485545> **Base de datos vacía.** No hay licencias generadas.');
            }
            if (page > maxPages) {
                return interaction.editReply(`⚠️ **Página no encontrada.** Solo tienes **${maxPages}** páginas de historial.`);
            }

            const skipAmount = (page - 1) * itemsPorPagina;

            const licenses = await License.find()
                .sort({ createdAt: -1 }) 
                .skip(skipAmount)        
                .limit(itemsPorPagina);  

            const listaFormateada = licenses.map((lic, index) => {
                let estadoIcono = '';
                let detalle = '';

                if (lic.isClaimed) {
                    estadoIcono = '<:2360cross:1440801107512266753> '; 
                    detalle = `<:76049user11:1440784770106785992> <@${lic.claimedBy}>`;
                } else {
                    estadoIcono = '<:1372checkmark:1440801086892937316> ';
                    detalle = '``LIBRE``';
                }

                const numeroReal = skipAmount + index + 1; 

                return `\`${numeroReal}.\` ${estadoIcono} \`${lic.key}\` - **${lic.product}** (${detalle})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`Inventario de Licencias`)
                .setDescription(listaFormateada)
                .setColor(0x050505)
                .setFooter({ text: `Página ${page} de ${maxPages} | Total: ${totalLicencias} licencias` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error paginando licencias:", error);
            await interaction.editReply('❌ Ocurrió un error al consultar la base de datos.');
        }
    },
};