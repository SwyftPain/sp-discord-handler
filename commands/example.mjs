import { EasyEmbed } from 'sp-easyembed';
const embed = new EasyEmbed();

export const name = 'example';
export const description = 'This is an example command.';
export const ownerOnly = false;
export const memberPermissions = ['MANAGE_MESSAGES'];
export const botPermissions = ['SEND_MESSAGES'];
export const minArgs = 1;
export const maxArgs = 1;
export const cooldown = 3;
export const aliases = ['ex'];
export const usage = '[argument]';
export const serverOnly = false;

export async function execute(client, message, args) {
  embed.setDescription(`The argument for this command was: ${args[0]}`);
  embed.setColor("Green");
  message.channel.send({embeds: [embed]});
}
