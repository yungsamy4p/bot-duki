const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { setChannel, toggleSystem } = require('../../utils/imageConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-images')
        .setDescription('Configura el sistema de auto-publicación de imágenes de Pinterest.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('set-channel')
                .setDescription('Define el canal donde se enviarán las imágenes.')
                .addChannelOption(option => 
                    option.setName('canal')
                        .setDescription('El canal de destino')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('toggle')
                .setDescription('Activa o desactiva el envío automático.')
                .addBooleanOption(option => 
                    option.setName('activo').setDescription('¿Sistema encendido?').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'set-channel') {
            const canal = interaction.options.getChannel('canal');
            setChannel(interaction.guild.id, canal.id);
            await interaction.reply({ content: `✅ Sistema configurado. Las imágenes de Pinterest llegarán al canal ${canal}.` });
        }

        if (sub === 'toggle') {
            const estado = interaction.options.getBoolean('activo');
            const resultado = toggleSystem(interaction.guild.id, estado);
            
            if (resultado) {
                await interaction.reply({ content: `✅ Sistema de imágenes **${estado ? 'ACTIVADO' : 'DESACTIVADO'}**.` });
            } else {
                await interaction.reply({ content: '⚠️ Primero debes configurar un canal con `/setup-images set-channel`.', ephemeral: true });
            }
        }
    },
};