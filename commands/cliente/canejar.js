const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const License = require('../../models/License');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canjear')
        .setDescription('Activa tu producto o rango usando tu licencia')
        .addStringOption(option => 
            option.setName('clave')
                .setDescription('Tu clave de licencia')
                .setRequired(true)),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const keyInput = interaction.options.getString('clave');
        const user = interaction.user;

        try {

            const license = await License.findOne({ key: keyInput });

            if (!license) {
                return interaction.editReply({ content: "<:2360cross:1440801107512266753> Licencia inválida o no existe.", flags: MessageFlags.Ephemeral });
            }

            if (license.isClaimed) {
                return interaction.editReply({ content: "<:730336sellbutton:1440796794899398726> Esta licencia ya fue utilizada anteriormente.", flags: MessageFlags.Ephemeral });
            }

            license.isClaimed = true;
            license.claimedBy = user.id;
            license.claimedAt = new Date();
            await license.save();


            const role = interaction.guild.roles.cache.find(r => r.name === "Cliente");
            if (role) {
                await interaction.member.roles.add(role).catch(e => console.log("No pude dar el rol:", e));
            }

            const dmEmbed = new EmbedBuilder()
                .setTitle('Comprobante de Activación')
                .setColor(0x050505)
                .setDescription(`<:43365donator:1440796613474783323> Hola **${user.username}**, tu servicio ha sido activado correctamente.`)
                .addFields(
                    { name: '<:87100compras:1440796665966755841> Servicio', value: `**${license.product}**`, inline: true },
                    { name: '<:809011form:1440796832799264908> Licencia Usada', value: `\`${license.key}\``, inline: true },
                    { name: '<:47836calendar:1440797793966100530> Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: false }
                )
                .setFooter({ text: 'Gracias por confiar en nuestros servicios!' })
                .setTimestamp();

            let dmStatus = "<:1372checkmark:1440801086892937316> Te he enviado el recibo por mensaje privado.";
            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {

                dmStatus = "<:1372checkmark:1440801086892937316> Canjeado, pero no pude enviarte el recibo al MD (Los tienes bloqueados).";
            }


            const publicEmbed = new EmbedBuilder()
                .setTitle("¡Licencia Activada!")
                .setDescription(`<:809011form:1440796832799264908> Has canjeado exitosamente: **${license.product}**\n\n${dmStatus}`)
                .setColor(0x050505);

            await interaction.editReply({ embeds: [publicEmbed], flags: MessageFlags.Ephemeral });

            // Log interno en consola
            console.log(`+ Venta: ${user.tag} canjeó ${license.product}`);

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.editReply({ content: 'Error crítico al procesar la licencia.', flags: MessageFlags.Ephemeral });
            }
        }
    },
};