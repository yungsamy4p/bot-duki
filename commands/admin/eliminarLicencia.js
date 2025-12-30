const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar-licencia')
        .setDescription('Elimina permanentemente una licencia de la base de datos')
        .addStringOption(option => 
            option.setName('clave')
                .setDescription('La Key de la licencia a eliminar')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const keyInput = interaction.options.getString('clave');

        try {

            const deletedLicense = await License.findOneAndDelete({ key: keyInput });

            if (!deletedLicense) {
                return interaction.editReply(`⚠️ **Error:** No se encontró ninguna licencia con la clave \`${keyInput}\`. Verifica que esté bien escrita.`);
            }

            // Confirmación visual
            const embed = new EmbedBuilder()
                .setTitle('<:64775trash:1440796593707155599> Licencia Eliminada')
                .setDescription(`La licencia ha sido purgada de la base de datos exitosamente.`)
                .addFields(
                    { name: '<:87100compras:1440796665966755841> Producto', value: deletedLicense.product, inline: true },
                    { name: '<:809011form:1440796832799264908> Clave', value: `\`${deletedLicense.key}\``, inline: true },
                    { name: '<:61927leftlinewings:1440799176366620711> Estado previo', value: deletedLicense.isClaimed ? '🔴 Usada' : '🟢 Disponible', inline: true }
                )
                .setColor(0x050505)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error al eliminar licencia:", error);
            await interaction.editReply('❌ Error crítico al intentar borrar la licencia.');
        }
    },
};