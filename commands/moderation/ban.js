const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tienePermiso } = require('../../utils/permissionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .addUserOption(option => 
            option.setName('usuario').setDescription('El usuario a banear').setRequired(true))
        .addStringOption(option => 
            option.setName('razon').setDescription('Razón del baneo')),

    async execute(interaction) {
        // 1. Verificación de Seguridad Interna (Protocolo Cortana)
        if (!tienePermiso(interaction, 'ban')) {
            return interaction.reply({ 
                content: '⛔ **Acceso Denegado.** No tienes autorización del sistema para ejecutar esta orden.', 
                ephemeral: true 
            });
        }

        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razon') || 'Sin razón especificada';
        const miembro = interaction.guild.members.cache.get(usuario.id);

        // 2. Validaciones básicas de jerarquía
        if (!miembro) {
            return interaction.reply({ content: 'Ese usuario no está en el servidor.', ephemeral: true });
        }
        if (!miembro.bannable) {
            return interaction.reply({ content: '❌ No puedo banear a este usuario (posiblemente tiene un rol superior al mío).', ephemeral: true });
        }
        if (interaction.member.roles.highest.position <= miembro.roles.highest.position) {
            return interaction.reply({ content: '❌ No puedes banear a alguien con un rol igual o superior al tuyo.', ephemeral: true });
        }

        // 3. Ejecución
        try {
            await miembro.ban({ reason: razon });
            
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 Usuario Baneado')
                .setDescription(`**Usuario:** ${usuario.tag}\n**Moderador:** ${interaction.user.tag}\n**Razón:** ${razon}`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al intentar banear al usuario.', ephemeral: true });
        }
    },
};