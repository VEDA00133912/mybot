const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletemessage')
    .setDescription('メッセージを削除します')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('削除したいメッセージの数(100以下)')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('メッセージを削除したいユーザー')),

  async execute(interaction) {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'あなたにメッセージ削除権限が有りません。', ephemeral: true });
    }
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'メッセージを管理する権限がありません。', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const count = interaction.options.getInteger('count');
    const user = interaction.options.getUser('user');
    const channel = interaction.channel;

    if (count > 100) {
      return interaction.editReply({ content: '一度に削除できるメッセージ数は 100 件までです。', ephemeral: true });
    }

    try {
      const messages = await channel.messages.fetch({ limit: count });
      const userMessages = user ? messages.filter(m => m.author.id === user.id) : messages;
      if (userMessages.size === 0) {
        return interaction.editReply({ content: 'ユーザーが見つかりません。', ephemeral: true });
      }
      const twoWeeksAgo = Date.now() - 1209600000; 
      const oldMessages = userMessages.filter(m => m.createdTimestamp < twoWeeksAgo);
      if (oldMessages.size > 0) {
        return interaction.editReply({ content: '2週間以上前のメッセージは削除できません。', ephemeral: true });
      }

      const deletedMessages = await channel.bulkDelete(userMessages.first(count), true);

      const embed = new EmbedBuilder()
        .setColor(0xf8b4cb)
        .setTitle('削除完了！')
        .setDescription(`削除したメッセージ数: ${deletedMessages.size}`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('メッセージの削除中にエラーが発生しました:', error);
      await interaction.editReply({ content: 'メッセージの削除中にエラーが発生しました。', ephemeral: true });
    }
  },
};
