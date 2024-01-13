import { existsSync, unlinkSync, writeFileSync } from "fs"
import { unpack } from "node-unar";
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

function onLoad() {
  const masoiGamePath = global.mainPath + "/plugins/commands/cache/masoi"
  const masoiGameListenDir = global.mainPath + "/plugins/onMessage/masoiGameListen.js"
  const masoiGameListen = `export default function ({ message }) {
  if (!global.gameManager || !global.gameManager.items.some(i => i.name == "Ma Sói")) return
  for (const game of global.gameManager.items) {
    if (!game.participants) continue
    if ((game.participants.includes(message.senderID) && !message.isGroup) || game.threadID == message.threadID) {
      game.onMessage(message, message.reply);
    }
  }
}`
  const citnutpath = global.pluginsPath + "/commands/cache/citnut"
  if (!existsSync(citnutpath)) global.createDir(citnutpath)
  if (!existsSync(masoiGameListenDir)) { writeFileSync(masoiGameListenDir, masoiGameListen, "utf8") }
  if (!existsSync(citnutpath + "/masoiLoad.js")) {
    writeFileSync(citnutpath + "/masoiLoad.js", `import GameManager from "../masoi/GameManager.js";
import MasoiGame from "../masoi/index.js";
export default {
  newAll() {
    global.gameManager = new GameManager({ masoi: MasoiGame })
  },
  addGameMasoi() {
    global.gameManager.import({ masoi: MasoiGame })
  }
}`)
  }
  if (!existsSync(masoiGamePath)) {
    if (existsSync(masoiGamePath + ".zip")) unlinkSync(masoiGamePath + ".zip");
    // link du phong: https://github.com/Citnut/xaviafb/raw/main/masoi.zip
    global.downloadFile(masoiGamePath + ".zip", "https://drive.google.com/u/0/uc?id=1uDCBKeKP5zp_FiNT-TTuZ1PYnJf96ZNk&export=download" + ".zip").then(p => {
      console.log("\x1b[36m[⬢ GAME]\x1b[0m Masoi download finished > unzip masoi.zip")
      unpack(p, global.pluginsPath + "/commands/cache")
        .progress((files) => {
          console.log('\x1b[36m[⬢ Files]\x1b[0m', files);
        })
        .then((results) => {
          console.log('\x1b[36m[⬢ Archive type]\x1b[0m', results.type);
          console.log('\x1b[36m[⬢ Archive files]\x1b[0m', results.files);
          console.log('\x1b[36m[⬢ Archive output directory]\x1b[0m', results.directory);
        })
      console.log("\x1b[36m[⬢ GAME]\x1b[0m Masoi installation is complete > restarting...")
    }).catch(console.log).finally(() => {
      global.restart()
    })
  }
}

const onCall = async ({ message, args }) => {
  if (!global.Users) global.Users = global.controllers.Users;
  if (!global.gameManager) { (await import("../cache/citnut/masoiLoad.js")).default.newAll() }
  else if (!global.gameManager.isValid("masoi")) (await import("../cache/citnut/masoiLoad.js")).default.addGameMasoi()
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
  onLoad,
  onCall
}
