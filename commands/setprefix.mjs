import { EasyEmbed } from 'sp-easyembed';
const embed = new EasyEmbed();

export const name = 'setprefix';
export const description = 'Sets the prefix for this server.';
export const ownerOnly = false;
export const memberPermissions = ['MANAGE_GUILD'];
export const botPermissions = ['SEND_MESSAGES'];
export const minArgs = 1;
export const maxArgs = 1;
export const usage = '[prefix]';
export const serverOnly = true;

export async function execute(client, message, args) {
  const newPrefix = args[0];
  client.prefixes.set(message.guild.id, newPrefix);
  embed.setDescription(`Prefix for this server has been set to \`${newPrefix}\`.`);
  embed.setColor("Green");
  message.channel.send({embeds: [embed]});
}