export default function ({ message }) {
  if (!global.gameManager || !global.gameManager.items.some(i => i.name == "Ma Sói")) return
  for (const game of global.gameManager.items) {
    if (!game.participants) continue
    if ((game.participants.includes(message.senderID) && !message.isGroup) || game.threadID == message.threadID) {
      game.onMessage(message, message.reply);
    }
  }
}
