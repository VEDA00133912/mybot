const Discord = require("discord.js");
const { Client, GatewayIntentBits, Partials, Intents, Collection,EmbedBuilder } = require("discord.js");
const { token } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.MessageContent],
  partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction]
});

// コマンドの登録
const fs = require('fs');

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// サーバー参加時にチャンネルの作製,コマンドの登録
client.on("guildCreate", async(guild) => {
    const channelExists = guild.channels.cache.some(channel => channel.name === 'えむbot開発室' && channel.type === 'GUILD_TEXT');

    if (!channelExists) {
        try {
            const channel = await guild.channels.create({
  "name": "えむbot開発室",
  "type": 0
}
);
            console.log(`チャンネルを作成しました: ${channel.name} (${channel.id})`);
            await channel.send('お知らせです。消さないでね');
        } catch (error) {
            console.error(`チャンネルの作成ができませんでした: ${guild.name}:${guild.id}`, error);
        }
    }

    try {
        const commands = client.commands.map(command => command.data.toJSON());
        await guild.commands.set(commands);
        console.log(`コマンドが登録されました: ${guild.name}:${guild.id}`);
    } catch (error) {
        console.error(`コマンドの登録ができませんでした: ${guild.name}:${guild.id}`, error);
    }
});

// 起動時にコマンドの登録,Activity,status等の設定
client.once('ready', async () => {
  console.log('起動ｼﾏｽ');

  const guildIds = client.guilds.cache.map(guild => guild.id);
  for (const guildId of guildIds) {
    try {
      const guild = await client.guilds.fetch(guildId);
      const commands = client.commands.map(command => command.data.toJSON());
      await guild.commands.set(commands);
console.log(`コマンドが登録されました: ${guild.name}:${guild.id}`);
    } catch (error) {
console.error(`コマンドの登録ができませんでした: ${guild.name}:${guild.id}`, error);
    }
  }
        client.guilds.cache.forEach(guild => {
        guild.members.fetch(client.user.id)
            .then(member => {
                member.setNickname('えむちゃん')
                    .then(() => console.log(`${guild.name}のニックネームが変更されました`))
                    .catch(error => console.error(`${guild.name}のニックネームの変更中にエラーが発生しました:`, error));
            })
            .catch(error => console.error(`${guild.name}のメンバー情報の取得中にエラーが発生しました:`, error));
    });
    client.user.setStatus('online');
    setInterval(() => {
        const activities = ["えむbotデス", "素数判定を実装しました"];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setActivity(randomActivity);
    }, 10000);
});

// コマンド
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'コマンドが無効です',
      ephemeral: true
    });
  }
});

client.on("messageCreate", (message) => {
    const targetChannelId = '転送したいチャンネルのID';
    if (message.channel.id === targetChannelId) {
        const targetMessage = message.content;
        client.guilds.cache.forEach(guild => {
const targetChannel = guild.channels.cache.find(channel => channel.type === 0 && channel.name === 'えむbot開発室');
            if (targetChannel) {
                targetChannel.send(`${targetMessage}`)
                    .then(() => console.log("メッセージが正常に転送されました。"))
                    .catch(error => console.error("メッセージの転送中にエラーが発生しました:", error));
            }
        });
    }
});

// メッセージリンクの展開
client.on('messageCreate', async message => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls) {
        for (const url of urls) {
            if (url.includes('discord.com/channels/')) {
                const urlParts = url.split('/');
                const guildId = urlParts[urlParts.indexOf('channels') + 1];
                const channelId = urlParts[urlParts.indexOf('channels') + 2];
                const messageId = urlParts[urlParts.indexOf('channels') + 3];

                try {
                    const fetchedMessage = await client.guilds.cache.get(guildId)?.channels.cache.get(channelId)?.messages.fetch(messageId);

                    if (fetchedMessage) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: fetchedMessage.author.tag, iconURL: fetchedMessage.author.displayAvatarURL() }) 
                            .setDescription(fetchedMessage.content)
                            .setColor(0xf8b4cb)
                            .setTimestamp(fetchedMessage.createdTimestamp); 

                        message.channel.send({ embeds: [embed] });
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
});

// サーバー参加時の通知(こっちに書いた後に上にあるguildcreateと統合しようとも思ったけどめんどいからやめた)
client.on("guildCreate", (guild) => {
    const targetGuildId = "通知したいサーバーのID";
    const targetChannelId2 = "通知したいチャンネルのID";
    try {
        const targetGuild = client.guilds.cache.get(targetGuildId);
        const targetChannel = targetGuild.channels.cache.get(targetChannelId2);
        if (targetChannel) {
            targetChannel.send(` ${guild.name}に参加したよ！`);
        }
    } catch (error) {
        console.error("参加通知エラーです:", error);
    }
});

client.login(token);

