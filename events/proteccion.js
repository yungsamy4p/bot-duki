const { Events, AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (message.member.permissions.has('Administrator')) return;
        
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const discordInvite = /(discord.gg|discord.com\/invite)/g;

        if (discordInvite.test(message.content)) {
            await message.delete();
            return message.channel.send(`🛡️ **Agente 117:** ${message.author}, no se permiten invitaciones aquí.`);
        }
        
    },
};