const { ButtonStyle, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js'); 

async function buttonPages(interaction, pages) {
    // エラーメッセージ
    if (!interaction) throw new Error("interactionが提供されていません");
    if (!pages) throw new Error("ページの引数の未記入エラー");
    if (!Array.isArray(pages)) throw new Error("ページが配列でないエラー");

    await interaction.deferReply();

    if (pages.length === 1) {
        const page = await interaction.editReply({
            embeds: pages,
            components: [],
            fetchReply: true,
        });
        return page;
    }

    // ボタン
    const prev = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const home = new ButtonBuilder()
        .setCustomId("home")
        .setLabel("最初に戻る")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶")
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(prev, home, next);
    let index = 0;

    const currentPage = await interaction.editReply({
        embeds: [pages[index]],
        components: [buttonRow],
        fetchReply: true,
    });

    const collector = await currentPage.createMessageComponentCollector({
        componentType: ComponentType.BUTTON,
    });

    collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id)
            return i.reply({
                content: "今は使えません",
                ephemeral: true,
            });

        // ボタンでページを切り替え
        await i.deferUpdate();

        if (i.customId === "prev") {
            if (index > 0) index--;
        } else if (i.customId === "home") {
            index = 0;
        } else if (i.customId === "next") {
            if (index < pages.length - 1) index++;
        }

        if (index === 0) prev.setDisabled(true);
        else prev.setDisabled(false);

        if (index === 0) home.setDisabled(true);
        else home.setDisabled(false);

        if (index === pages.length - 1) next.setDisabled(true);
        else next.setDisabled(false);

        await currentPage.edit({
            embeds: [pages[index]],
            components: [buttonRow],
        });

        collector.resetTimer();
    });

    setTimeout(async () => {
        await interaction.deleteReply();
    }, 60 * 1000); // 60秒後にembedを削除

    return currentPage;
}

module.exports = buttonPages;