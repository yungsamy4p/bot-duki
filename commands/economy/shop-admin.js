const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { crearItem, eliminarItem, editarItem, cargarTienda } = require('../../utils/shopHandler');
const { tienePermiso } = require('../../utils/permissionHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop-admin')
        .setDescription('Gestiona los artículos de la tienda.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Seguridad base
        
        // Subcomando: CREAR
        .addSubcommand(subcommand =>
            subcommand
                .setName('crear')
                .setDescription('Añade un nuevo artículo a la tienda.')
                .addStringOption(option => option.setName('nombre').setDescription('Nombre del artículo').setRequired(true))
                .addIntegerOption(option => option.setName('precio').setDescription('Precio en DukiCoins').setRequired(true))
                .addRoleOption(option => option.setName('rol').setDescription('Rol que se entregará').setRequired(true))
        )
        
        // Subcomando: ELIMINAR
        .addSubcommand(subcommand =>
            subcommand
                .setName('eliminar')
                .setDescription('Elimina un artículo de la tienda.')
                .addStringOption(option => 
                    option.setName('nombre')
                        .setDescription('Nombre del artículo a borrar')
                        .setRequired(true)
                        .setAutocomplete(true))
        )
        
        // Subcomando: EDITAR
        .addSubcommand(subcommand =>
            subcommand
                .setName('editar')
                .setDescription('Edita el precio o el rol de un artículo existente.')
                .addStringOption(option => 
                    option.setName('nombre')
                        .setDescription('Nombre del artículo a editar')
                        .setRequired(true)
                        .setAutocomplete(true))
                .addIntegerOption(option => option.setName('nuevo_precio').setDescription('Nuevo precio (opcional)'))
                .addRoleOption(option => option.setName('nuevo_rol').setDescription('Nuevo rol (opcional)'))
        ),

    // Autocompletado para buscar nombres de items fácilmente
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const items = cargarTienda();
        const filtered = items.filter(item => item.name.toLowerCase().includes(focusedValue));
        
        // Discord permite máximo 25 opciones
        await interaction.respond(
            filtered.slice(0, 25).map(item => ({ name: item.name, value: item.name }))
        );
    },

    async execute(interaction) {
        // Verificación de seguridad interna (Tu sistema /perms)
        // Puedes usar un permiso general 'admin-shop' o específicos 'create-item', etc.
        if (!tienePermiso(interaction, 'manage-shop')) {
            return interaction.reply({ content: '⛔ No tienes permisos de intendencia para modificar la tienda.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'crear') {
            const nombre = interaction.options.getString('nombre');
            const precio = interaction.options.getInteger('precio');
            const rol = interaction.options.getRole('rol');

            const exito = crearItem(nombre, precio, rol.id);

            if (exito) {
                return interaction.reply({ content: `✅ Artículo **${nombre}** creado.\n💰 Precio: $${precio}\n🎁 Rol: ${rol.name}` });
            } else {
                return interaction.reply({ content: `⚠️ Ya existe un artículo con el nombre **${nombre}**.`, ephemeral: true });
            }
        }

        if (subcommand === 'eliminar') {
            const nombre = interaction.options.getString('nombre');
            const exito = eliminarItem(nombre);

            if (exito) {
                return interaction.reply({ content: `🗑️ Artículo **${nombre}** eliminado correctamente.` });
            } else {
                return interaction.reply({ content: `❌ No encontré el artículo **${nombre}**.`, ephemeral: true });
            }
        }

        if (subcommand === 'editar') {
            const nombre = interaction.options.getString('nombre');
            const nuevoPrecio = interaction.options.getInteger('nuevo_precio');
            const nuevoRol = interaction.options.getRole('nuevo_rol');

            if (!nuevoPrecio && !nuevoRol) {
                return interaction.reply({ content: '⚠️ Debes especificar al menos un cambio (precio o rol).', ephemeral: true });
            }

            const nuevoRolId = nuevoRol ? nuevoRol.id : null;
            const exito = editarItem(nombre, nuevoPrecio, nuevoRolId);

            if (exito) {
                return interaction.reply({ content: `✏️ Artículo **${nombre}** actualizado.` });
            } else {
                return interaction.reply({ content: `❌ No se pudo editar. Verifica que el artículo exista.`, ephemeral: true });
            }
        }
    },
};