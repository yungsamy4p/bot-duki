const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra tu perfil de cliente y tus servicios adquiridos')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('(Opcional) Ver perfil de otro usuario - Solo Staff')
        ),

    async execute(interaction) {

        let targetUser = interaction.options.getUser('usuario') || interaction.user;

        if (targetUser.id !== interaction.user.id && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '🔒 Solo puedes ver tu propio perfil.', ephemeral: true });
        }

        await interaction.deferReply();

        try {

            const userLicenses = await License.find({ claimedBy: targetUser.id, isClaimed: true });

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Perfil de Cliente`, iconURL: interaction.guild.iconURL() })
                .setTitle(`Nombre: ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setColor(0x050505);

            if (userLicenses.length === 0) {
                embed.setDescription('<:2360cross:1440801107512266753> **Este usuario no tiene servicios activos.**\n\nVisita nuestros canales de venta para adquirir productos.');
                embed.addFields({ name: 'Estado', value: 'Visitante', inline: true });
            } else {
                // Crear lista de productos
                const productList = userLicenses.map(lic => {
                    const fecha = `<t:${Math.floor(lic.claimedAt.getTime() / 1000)}:R>`; // "Hace X días"
                    return `• **${lic.product}** (${fecha})`;
                }).join('\n');

                embed.setDescription(`<:80012verified:1440784449682935928> **Cliente Verificado**\n\n<:87100compras:1440796665966755841> **Servicios Adquiridos:**\n${productList}`);
                embed.addFields(
                    { name: 'Total Compras', value: `${userLicenses.length}`, inline: true },
                    { name: 'ID Cliente', value: `\`${targetUser.id}\``, inline: true }
                );
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al cargar el perfil.');
        }
    },
};