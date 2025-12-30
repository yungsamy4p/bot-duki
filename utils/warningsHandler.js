const fs = require('fs');
const path = './advertencias.json';

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

function cargarWarnings() {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function guardarWarnings(datos) {
    fs.writeFileSync(path, JSON.stringify(datos, null, 2));
}

function agregarWarning(guildId, userId, modTag, razon) {
    const datos = cargarWarnings();
    const key = `${guildId}-${userId}`;
    
    if (!datos[key]) datos[key] = [];
    
    const idWarn = Date.now().toString().slice(-6); // ID simple de 6 dígitos
    datos[key].push({ id: idWarn, mod: modTag, razon, fecha: Date.now() });
    
    guardarWarnings(datos);
    return idWarn;
}

function borrarWarning(guildId, userId, idWarn) {
    const datos = cargarWarnings();
    const key = `${guildId}-${userId}`;
    
    if (!datos[key]) return false;
    
    const indice = datos[key].findIndex(w => w.id === idWarn);
    if (indice === -1) return false;
    
    datos[key].splice(indice, 1);
    guardarWarnings(datos);
    return true;
}

function obtenerWarnings(guildId, userId) {
    const datos = cargarWarnings();
    const key = `${guildId}-${userId}`;
    return datos[key] || []; // Devuelve el array de warns o un array vacío si no tiene
}

module.exports = { agregarWarning, borrarWarning, cargarWarnings, obtenerWarnings };