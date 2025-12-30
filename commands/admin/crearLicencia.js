const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const License = require('../../models/License');
const { v4: uuidv4 } = require('uuid'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generar-licencia')
        .setDescription('Crea una nueva licencia de producto')
        .addStringOption(option => 
            option.setName('producto')
                .setDescription('Nombre del servicio (ej: Base FiveM)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const product = interaction.options.getString('producto');

        const key = uuidv4().split('-')[0].toUpperCase(); 

        try {
            // Guardar en Base de Datos
            const newLicense = new License({
                key: key,
                product: product
            });

            await newLicense.save();

            // --- CREACIÓN DEL EMBED ---
            const embed = new EmbedBuilder()
                .setTitle('Licencia Generada Exitosamente')
                .setColor(0x050505)
                .addFields(
                    { name: '<:84918explorer:1440784798510485545> Producto / Servicio', value: `\`\`\`${product}\`\`\``, inline: false },
                    { name: '<:73997windowsdefender:1440784829196275975> Clave de Activación', value: `\`\`\`${key}\`\`\``, inline: false } // Triple comilla para fácil copiado
                )
                .setFooter({ text: 'Esta licencia es válida por 1 solo uso.' })
                .setTimestamp();

            await interaction.reply({ 
                embeds: [embed], 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error("Error al crear licencia:", error);
            
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: '❌ Hubo un error interno al guardar la licencia.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
    },
};