require('dotenv').config(); // Cargar variables de entorno
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

const { execSync } = require('child_process');

console.log("🔄 [Auto-Deploy] Iniciando actualización de comandos...");

try {
    // Esto ejecuta "node deploy-commands.js" y espera a que termine antes de seguir
    execSync('node deploy-commands.js', { stdio: 'inherit' });
    console.log("[Auto-Deploy] Comandos sincronizados correctamente.");
} catch (error) {
    console.error("[Auto-Deploy] Falló la actualización de comandos (El bot iniciará igual).");
    // No mostramos el error completo para no ensuciar, pero podrías poner console.error(error);
}

// --- 1. Inicialización del Cliente con Permisos (Intents) ---
// Para el Anti-Raid y Moderación necesitamos ver mensajes y miembros
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Necesario para bienvenida y anti-bot
        GatewayIntentBits.GuildMessages, // Necesario para anti-spam/links
        GatewayIntentBits.MessageContent, // CRITICO: Para leer el contenido de los mensajes (links)
    ]
});

// Colección para guardar los comandos en memoria
client.commands = new Collection();

// --- 2. Conexión a Base de Datos (MongoDB) ---
(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[Base de Datos] Conectada a MongoDB exitosamente.');
    } catch (error) {
        console.error('[Error BD] No se pudo conectar a MongoDB:', error);
    }
})();

// --- 3. Cargador de Comandos (Command Handler) ---
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // Verificar que el comando tenga "data" y "execute"
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[Comando] Cargado: ${command.data.name}`);
        } else {
            console.log(`[Alerta] El comando en ${filePath} le falta "data" o "execute".`);
        }
    }
}

// --- 4. Cargador de Eventos (Event Handler) ---
const eventsPath = path.join(__dirname, 'events');
// Verificamos si la carpeta events existe para evitar errores
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// --- 5. Gestión de Interacciones (Slash Commands) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No se encontró el comando ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        } else {
            await interaction.reply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
        }
    }
});

// --- 6. Encendido ---
const { Events } = require('discord.js'); // Asegúrate de importar Events arriba si no está

client.once(Events.ClientReady, c => {
    console.log(`[Sistema] Operativo como "${c.user.tag}"`);
    client.user.setActivity('Servicios & Seguridad');
});

client.login(process.env.TOKEN);