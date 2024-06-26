const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const player = require('../player');

let loop = false;

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        const messageId = interaction.message.id;
        if (interaction.deferred || interaction.replied) return;

        const randomString = customId.slice(customId.lastIndexOf('_') + 1);

        if (customId.startsWith('play_')) {
            if (player.state.status === AudioPlayerStatus.Paused) {
                player.unpause();
                await interaction.reply({ content: '再生を再開しました', ephemeral: true });
            } else {
                await interaction.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(customId) 
                                    .setLabel('再生')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId(`pause_${messageId}_${randomString}`)
                                    .setLabel('一時停止')
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId(`loop_${messageId}_${randomString}`) 
                                    .setLabel('ループ')
                                    .setStyle(ButtonStyle.Primary)
                            )
                    ]
                });
            }
        }

        if (customId.startsWith('pause_')) {
            if (player.state.status === AudioPlayerStatus.Playing) {
                player.pause();
                await interaction.reply({ content: '一時停止しました', ephemeral: true });
            } else {
                await interaction.update({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`play_${messageId}_${randomString}`) 
                                    .setLabel('再生')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId(customId) 
                                    .setLabel('一時停止')
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId(`loop_${messageId}_${randomString}`) 
                                    .setLabel('ループ')
                                    .setStyle(ButtonStyle.Primary)
                            )
                    ]
                });
            }
        }

        if (customId.startsWith('loop_')) {
            loop = !loop;

            await interaction.reply({
                content: `ループを${loop ? '有効化' : '無効化'}しました`,
                ephemeral: true
            });

            await interaction.update({
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`play_${messageId}_${randomString}`) 
                                .setLabel('再生')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`pause_${messageId}_${randomString}`) 
                                .setLabel('一時停止')
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId(customId) 
                                .setLabel('ループ')
                                .setStyle(ButtonStyle.Primary)
                        )
                ]
            });
        }

        player.on(AudioPlayerStatus.Idle, () => {
            if (loop && currentResource) {
                player.play(currentResource);
            }
        });
    }
};
