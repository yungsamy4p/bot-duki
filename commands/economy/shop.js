const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cargarTienda } = require('../../utils/shopHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra los artículos disponibles para comprar.'),
    
    // ⚠️ ELIMINAMOS LA LÍNEA 'itemsTienda,' QUE CAUSABA EL ERROR

    async execute(interaction) {
        // Cargamos la tienda "en vivo" cada vez que alguien usa el comando
        const itemsTienda = cargarTienda();

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🛒 Tienda del Servidor')
            .setDescription('Usa `/buy <nombre>` para comprar un artículo.');

        if (itemsTienda.length === 0) {
            embed.setDescription('🚫 La tienda está vacía por el momento.\nDile a un administrador que use `/shop-admin crear` para añadir cosas.');
        } else {
            itemsTienda.forEach(item => {
                embed.addFields({ 
                    name: `${item.name}`, 
                    value: `💰 Precio: **$${item.price}**`, 
                    inline: true 
                });
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};