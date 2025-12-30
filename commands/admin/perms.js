const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { cargarPermisos, guardarPermisos } = require('../../utils/permissionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perms')
        .setDescription('Gestiona los permisos internos del bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo admins pueden configurar esto
        .addSubcommand(subcommand =>
            subcommand
                .setName('allow')
                .setDescription('Otorga un permiso a un rol.')
                .addRoleOption(option => 
                    option.setName('rol').setDescription('El rol a configurar').setRequired(true))
                .addStringOption(option => 
                    option.setName('accion').setDescription('La acción a permitir (ej: ban, kick)').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'allow') {
            const rol = interaction.options.getRole('rol');
            const accion = interaction.options.getString('accion').toLowerCase();

            const datos = cargarPermisos();

            // Inicializar array si el rol no existe en la BD
            if (!datos[rol.id]) {
                datos[rol.id] = [];
            }

            // Evitar duplicados
            if (datos[rol.id].includes(accion)) {
                return interaction.reply({ 
                    content: `⚠️ El rol ${rol.name} ya tiene permiso para **${accion}**.`, 
                    ephemeral: true 
                });
            }

            datos[rol.id].push(accion);
            guardarPermisos(datos);

            return interaction.reply({ 
                content: `✅ Permiso concedido: Ahora el rol **${rol.name}** puede usar la acción **${accion}**.` 
            });
        }
    },
};