const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Configuración de la tienda (ID del rol : Precio)
// IMPORTANTE: Cambia estos IDs por los roles reales de tu servidor DUKI
const { cargarTienda } = require('../../utils/shopHandler');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra los artículos disponibles para comprar.'),
    
    // Exportamos la lista para usarla en el comando 'buy' también
    itemsTienda, 

    async execute(interaction) {

        const itemsTienda = cargarTienda();

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🛒 Tienda del Servidor')
            .setDescription('Usa `/buy <nombre>` para comprar un artículo.');

        itemsTienda.forEach(item => {
            embed.addFields({ 
                name: `${item.name}`, 
                value: `💰 Precio: **$${item.price}**`, 
                inline: true 
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};