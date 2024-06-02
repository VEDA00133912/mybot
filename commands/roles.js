// https://github.com/InFuzzz/discord-rolelist-commmand/blob/main/rolelist.js　参考

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('サーバー内のロール一覧を表示します。'),
    async execute(interaction) {

        if (cooldowns.has(interaction.user.id)) {
            const expirationTime = cooldowns.get(interaction.user.id);
            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;
                await interaction.reply({ content: `コマンドが利用できるまであと ${timeLeft.toFixed(1)} 秒待ってね`, ephemeral: true });
                return;
            }
        }

        const cooldownTime = 60000; 
        cooldowns.set(interaction.user.id, Date.now() + cooldownTime);

        const roles = interaction.guild.roles.cache;
        const sortedRoles = roles.sort((a, b) => b.position - a.position);
        const roleList = sortedRoles.map(r => `${r}`).join("\n");

        const embed = new EmbedBuilder()
            .setTitle('サーバーのロール一覧')
            .setDescription(`>>> ${roleList}`)
            .setColor(0xf8b4cb)
            .setFooter({ text: 'このメッセージは1分後に削除されます！' });

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        setTimeout(() => {
            reply.delete();
        }, 60000);
    },
};
