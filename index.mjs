import * as dotenv from "dotenv";
dotenv.config();

import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
  PermissionsBitField,
} from "discord.js";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { EasyEmbed } from "sp-easyembed";
import { promises as fsPromises } from "fs";
const embed = new EasyEmbed();

import { defaultPrefix } from "./config.mjs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});
client.commands = new Collection();
client.prefixes = new Collection();
client.cooldowns = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commandFiles = (
  await fsPromises.readdir(join(__dirname, "commands"))
).filter((file) => file.endsWith(".mjs"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.name, {
    ...command,
    isServerOnly: !!command.serverOnly,
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${defaultPrefix}help`, {
    type: ActivityType.Listening,
  });
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const prefixMention = `<@${client.user.id}> `;
  const prefix = message.guild // Check if message.guild is truthy
    ? client.prefixes.get(message.guild.id) || defaultPrefix
    : defaultPrefix;

  if (
    !message.content.startsWith(prefix) &&
    !message.content.startsWith(prefixMention)
  )
    return;

  let args;
  if (message.content.startsWith(prefixMention)) {
    args = message.content.slice(prefixMention.length).split(/ +/);
  } else {
    args = message.content.slice(prefix.length).split(/ +/);
  }
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  if (message.guild == null && command.isServerOnly) {
    embed.setDescription("I can't execute that command inside DMs!");
    embed.setColor("Red");
    return message.channel.send({ embeds: [embed] });
  }

  if (
    command.memberPermissions &&
    message.member &&
    !message.member.permissions.has(command.memberPermissions)
  ) {
    embed.setDescription("You don't have permission to use this command!");
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }
  if (
    command.botPermissions &&
    message.channel.type === "text" &&
    !message.channel.permissionsFor(client.user).has(command.botPermissions)
  ) {
    embed.setDescription("I don't have permission to execute this command!");
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }
  if (command.ownerOnly && message.author.id !== process.env.OWNER_ID) {
    embed.setDescription("You are not the bot owner!");
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }
  if (command.minArgs && args.length < command.minArgs) {
    let reply = `You didn't provide enough arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    embed.setDescription(reply);
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }
  if (command.maxArgs && args.length > command.maxArgs) {
    let reply = `You provided too many arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    embed.setDescription(reply);
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }

  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      embed.setDescription(
        `Please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
      embed.setColor("Red");
      return message.reply({ embeds: [embed] });
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(client, message, args);
  } catch (error) {
    console.error(error);
    embed.setDescription("There was an error trying to execute that command!");
    embed.setColor("Red");
    return message.reply({ embeds: [embed] });
  }
});

client.login(process.env.token);
