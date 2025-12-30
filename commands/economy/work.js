const { SlashCommandBuilder } = require('discord.js');
const { agregarDinero } = require('../../utils/economyHandler');

// Mapa para guardar los tiempos de espera en memoria
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabaja para ganar dinero.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const cooldownTime = 60 * 60 * 1000; // 1 Hora en milisegundos

        if (cooldowns.has(userId)) {
            const expiracion = cooldowns.get(userId) + cooldownTime;
            if (Date.now() < expiracion) {
                const tiempoRestante = (expiracion - Date.now()) / 1000 / 60;
                return interaction.reply({ 
                    content: `⏳ Debes descansar. Podrás volver a trabajar en **${tiempoRestante.toFixed(0)} minutos**.`, 
                    ephemeral: true 
                });
            }
        }

        // Ganancia aleatoria entre 50 y 200
        const ganancia = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
        
        agregarDinero(interaction.guild.id, userId, ganancia);
        
        // Registrar cooldown
        cooldowns.set(userId, Date.now());

        // Mensajes aleatorios de trabajo
        const trabajos = [
            'Ayudaste a organizar un evento de Duki.',
            'Vendiste entradas en la reventa (legalmente, claro).',
            'Hiciste de DJ en una fiesta privada.',
            'Programaste un bot para el servidor.'
        ];
        const trabajoRealizado = trabajos[Math.floor(Math.random() * trabajos.length)];

        await interaction.reply({ content: `✅ **¡Trabajo completado!**\n${trabajoRealizado}\nGanaste: **$${ganancia}**` });
    },
};