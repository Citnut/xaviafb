import { existsSync, writeFileSync } from "fs"
import GameManager from "../cache/masoi/GameManager.js"
import MasoiGame from "../cache/masoi/index.js"
const config = {
  name: "masoi",
  version: "1.0.0",
  // hasPermssion: 0,
  credits: "D-Jukie convert Kb2aBot (Citnut mang sang Xaviabot)",
  description: "idk",
  // commandCategory: "Game",
  usage: "",
  cooldowns: 5
};
const masoiGameListenDir = process.cwd() + "/plugins/onMessage/masoiGameListen.js"
const masoiGameListen = `export default function ({ message }) {
  if (!global.gameManager || !global.gameManager.items.some(i => i.name == "Ma Sói")) return
  for (const game of global.gameManager.items) {
    if (!game.participants) continue
    if ((game.participants.includes(message.senderID) && !message.isGroup) || game.threadID == message.threadID) {
      game.onMessage(message, message.reply);
    }
  }
}`
try {
  if (!existsSync(masoiGameListenDir)) {
    writeFileSync(masoiGameListenDir, masoiGameListen)
    global.restart()
  }
  global.gameManager = new GameManager({ masoi: MasoiGame })
  global.Users = global.controllers.Users
}
catch { console.log }

const onCall = ({ message, args }) => {
  global.gameManager.run(config.name, {
    masterID: message.senderID,
    threadID: message.threadID,
    param: args,
    isGroup: message.isGroup,
    send: message.send
  })
}
export default {
  config,
  onCall
}