// commands/admin/perms-list.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perms-list')
        .setDescription('Muestra la lista de claves de permisos disponibles para usar en /perms allow.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#2ECC71') // Verde esmeralda
            .setTitle('🛡️ Nodos de Permisos del Sistema')
            .setDescription('Utiliza estas claves exactas en el comando `/perms allow <rol> <acción>` para otorgar acceso sin dar permisos de administrador.')
            .addFields(
                { 
                    name: '👮 Moderación (Castigos)', 
                    value: '`ban` - Banear usuarios\n`kick` - Expulsar usuarios\n`timeout` - Aislar (Mute temporal)\n`mute` - Alias de timeout\n`un-timeout` - Retirar aislamiento\n`un-mute` - Alias de un-timeout',
                    inline: false 
                },
                { 
                    name: '⚠️ Sistema de Advertencias', 
                    value: '`warn` - Emitir una advertencia\n`remove-warn` - Eliminar una advertencia específica\n`warn-list` - Ver historial delictivo de alguien',
                    inline: false 
                },
                { 
                    name: '💰 Economía y Tienda', 
                    value: '`manage-shop` - Crear, editar y borrar ítems de la tienda (/shop-admin)',
                    inline: false 
                }
                // Aquí añadiremos los futuros permisos cuando implementemos los módulos restantes
                // { name: '🔧 Utilidad', value: '`lock-webhooks`\n`send-images`', inline: false } 
            )
            .setFooter({ text: 'Sistema Operativo DUKI | Protocolo Cortana' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};