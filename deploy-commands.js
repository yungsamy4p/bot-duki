const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

// --- DIAGNÓSTICO INICIAL ---
console.log("[Inicio] Script de despliegue arrancado.");

// Verificación de variables de entorno
if (!process.env.TOKEN) {
    console.error("[ERROR CRÍTICO] No se detecta el TOKEN en el archivo .env");
    process.exit(1);
}
if (!process.env.CLIENT_ID) console.warn("[Aviso] Falta CLIENT_ID en .env");
if (!process.env.GUILD_ID) console.warn("[Aviso] Falta GUILD_ID en .env");

console.log("[Entorno] Variables cargadas.");

const commands = [];
const foldersPath = path.join(__dirname, 'commands');

console.log(`[Rutas] Buscando carpeta 'commands' en: ${foldersPath}`);

// Verificación de existencia de carpeta
if (!fs.existsSync(foldersPath)) {
    console.error("[ERROR] La carpeta 'commands' NO EXISTE en esa ruta.");
    process.exit(1);
}

const commandFolders = fs.readdirSync(foldersPath);
console.log(`[Carpetas] Se encontraron ${commandFolders.length} subcarpetas.`);

for (const folder of commandFolders) {
    // Evitar archivos sueltos como .DS_Store
    if (folder.includes('.')) continue;

    console.log(`Explorando carpeta: ${folder}`);
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    console.log(`Archivos .js encontrados: ${commandFiles.length}`);

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`Comando cargado: ${command.data.name}`);
            } else {
                console.log(`[Advertencia] El comando ${file} le falta 'data' o 'execute'.`);
            }
        } catch (error) {
            console.error(`[Error de Código] Fallo al leer ${file}:`, error.message);
        }
    }
}

console.log(`[Resumen] Total comandos listos para subir: ${commands.length}`);

if (commands.length === 0) {
    console.error("[Stop] No hay comandos para subir. El proceso se detiene.");
    process.exit(1);
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`[Conexión] Iniciando despliegue en múltiples servidores...`);


        const guildIds = process.env.GUILD_IDS.split(',');

        for (const guildId of guildIds) {
            console.log(`Enviando comandos al servidor ID: ${guildId}`);
            
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body: commands },
            );
        }

        console.log(`[ÉXITO] Comandos registrados en ${guildIds.length} servidores.`);
    } catch (error) {
        console.error("[ERROR] Falló el registro:", error);
    }
})();