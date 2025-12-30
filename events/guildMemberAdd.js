const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {

    try {
        const welcomeEmbed = new EmbedBuilder() // Recuerda importar EmbedBuilder arriba
        .setTitle(`Bienvenido a la YS Services, ${member.user.username}`)
        .setDescription("Aquí tienes las herramientas para dominar. \n\n**¿Buscas seguridad o scripts FiveM?**\nRevisa nuestros canales de venta: <#1441270959880405074> del servidor https://discord.gg/y2DwaCgDba")
        .setColor(0x050505);
    
    await member.send({ embeds: [welcomeEmbed] });

        } catch (error) {
             console.log(`No pude enviar DM a ${member.user.tag} (Los tiene cerrados).`);
        }


        // Solo nos importa si entra un BOT
        if (!member.user.bot) return;

        console.log(`[Alerta] Un bot ha entrado al servidor: ${member.user.tag}`);

        try {

            await new Promise(res => setTimeout(res, 1000));

            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.BotAdd,
            });

            const logEntry = fetchedLogs.entries.first();
            if (!logEntry) return;

            const { executor, target } = logEntry;


            if (target.id !== member.id) return;

            // --- LISTA BLANCA ---
            const whitelist = [
                member.guild.ownerId, 
                "1194159374722158632"
            ];


            if (!whitelist.includes(executor.id)) {
                console.log(`ALERTA: ${executor.tag} metió un bot no autorizado.`);


                await member.kick(`Anti-Bot: Añadido por usuario no autorizado (${executor.tag})`)
                    .catch(e => console.error("No pude kickear al bot:", e));


                try {

                    const culpritMember = await member.guild.members.fetch(executor.id);


                    if (culpritMember.manageable) {

                        await culpritMember.roles.set([]);
                        
                        console.log(`[Castigo] Se le han quitado todos los roles a ${executor.tag}`);
                        

                        await culpritMember.send("<:73997windowsdefender:1440784829196275975> **Seguridad:** Se te han retirado los roles por introducir un bot sin autorización.")
                            .catch(() => console.log("No se pudo enviar DM al usuario."));
                            
                    } else {
                        console.log(`No pude quitar roles a ${executor.tag}. Su rol es superior al mío.`);
                    }
                } catch (err) {
                    console.error("Error al intentar quitar roles:", err);
                }

            } else {
                console.log(`Bot autorizado (Añadido por Staff/Whitelist).`);
            }

        } catch (error) {
            console.error(`Error en el sistema Anti-Bot:`, error);
        }
    },
};