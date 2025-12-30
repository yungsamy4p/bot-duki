const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { obtenerSaldo } = require('../../utils/economyHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu saldo actual o el de otro usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar')),

    async execute(interaction) {
        const usuario = interaction.options.getUser('usuario') || interaction.user;
        const saldo = obtenerSaldo(interaction.guild.id, usuario.id);

        const embed = new EmbedBuilder()
            .setColor('#F1C40F') // Dorado
            .setTitle(`💰 Billetera de ${usuario.username}`)
            .setDescription(`**Saldo:** $${saldo} DukiCoins`);

        await interaction.reply({ embeds: [embed] });
    },
};