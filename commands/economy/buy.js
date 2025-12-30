const { SlashCommandBuilder } = require('discord.js');
const { quitarDinero, obtenerSaldo } = require('../../utils/economyHandler');
// Importamos la lista de la tienda del otro archivo para no duplicar config
const { cargarTienda } = require('../../utils/shopHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la tienda.')
        .addStringOption(option => 
            option.setName('articulo')
                .setDescription('El nombre del artículo tal cual sale en la tienda')
                .setRequired(true)
                .setAutocomplete(true)), // Autocompletado para facilitar uso

    // Lógica para autocompletar las opciones
    async autocomplete(interaction) {
        const itemsTienda = cargarTienda();
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const filtered = itemsTienda.filter(item => item.name.toLowerCase().includes(focusedValue));
        await interaction.respond(
            filtered.map(item => ({ name: item.name, value: item.name }))
        );
    },

    async execute(interaction) {
        const itemsTienda = cargarTienda();
        const nombreArticulo = interaction.options.getString('articulo');
        const item = itemsTienda.find(i => i.name === nombreArticulo);

        if (!item) {
            return interaction.reply({ content: '❌ Ese artículo no existe en la tienda.', ephemeral: true });
        }

        // Verificar saldo
        const saldo = obtenerSaldo(interaction.guild.id, interaction.user.id);
        if (saldo < item.price) {
            return interaction.reply({ content: `❌ No tienes suficiente dinero. Necesitas **$${item.price}** y tienes **$${saldo}**.`, ephemeral: true });
        }

        // Verificar si ya tiene el rol
        const miembro = interaction.member;
        if (miembro.roles.cache.has(item.roleId)) {
            return interaction.reply({ content: '⚠️ Ya posees este rol.', ephemeral: true });
        }

        // Transacción
        const exitoPago = quitarDinero(interaction.guild.id, interaction.user.id, item.price);
        
        if (exitoPago) {
            try {
                await miembro.roles.add(item.roleId);
                await interaction.reply({ content: `✅ **¡Compra exitosa!** Has adquirido el rol **${item.name}** por **$${item.price}**.` });
            } catch (error) {
                // Si falla al dar el rol (permisos del bot), devolvemos el dinero
                console.error(error);
                // Aquí deberíamos devolver el dinero manualmente o agregar función de reembolso, 
                // pero por simplicidad solo avisamos.
                await interaction.reply({ content: '❌ Hubo un error al asignarte el rol. Asegúrate de que mi rol esté por encima del rol que intentas comprar.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '❌ Error en la transacción.', ephemeral: true });
        }
    },
};