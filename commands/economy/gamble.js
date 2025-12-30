const { SlashCommandBuilder } = require('discord.js');
const { obtenerSaldo, agregarDinero, quitarDinero } = require('../../utils/economyHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Apuesta tu dinero. ¡Doble o nada!')
        .addIntegerOption(option => 
            option.setName('cantidad').setDescription('Cantidad a apostar').setRequired(true).setMinValue(10)),

    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const saldoActual = obtenerSaldo(interaction.guild.id, interaction.user.id);

        if (saldoActual < cantidad) {
            return interaction.reply({ content: '❌ No tienes suficiente dinero para esa apuesta.', ephemeral: true });
        }

        // Probabilidad de ganar (45% para que la casa siempre gane a la larga)
        const victoria = Math.random() < 0.45;

        if (victoria) {
            agregarDinero(interaction.guild.id, interaction.user.id, cantidad); // Se suma la cantidad (ya tenías tu base)
            return interaction.reply({ content: `🎰 **¡GANASTE!** La suerte te sonríe.\nHas ganado **$${cantidad}**. Nuevo saldo: **$${saldoActual + cantidad}**` });
        } else {
            quitarDinero(interaction.guild.id, interaction.user.id, cantidad);
            return interaction.reply({ content: `📉 **PERDISTE.** Mejor suerte la próxima.\nPerdiste **$${cantidad}**. Nuevo saldo: **$${saldoActual - cantidad}**` });
        }
    },
};