import { existsSync, unlinkSync, writeFileSync } from "fs"
import { unpack } from "node-unar";

const src = "https://github.com/Citnut/xaviafb/raw/main/masoi.zip";
const masoiGamePath = process.cwd() + "/core/var/assets/masoi";
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
  if (!existsSync(masoiGamePath)) {
    if (existsSync(masoiGamePath + ".zip")) unlinkSync(masoiGamePath + ".zip");
    global.downloadFile(masoiGamePath + ".zip", src).then(p => {
      console.log("\x1b[36m[⬢ GAME]\x1b[0m Masoi download finished > unzip masoi.zip")
      unpack(p, global.mainPath + "/core/var/assets")
        .progress((files) => {
          console.log('\x1b[36m[⬢ Files]\x1b[0m', files);
        })
        .then((results) => {
          console.log('\x1b[36m[⬢ Archive type]\x1b[0m', results.type);
          console.log('\x1b[36m[⬢ Archive files]\x1b[0m', results.files);
          console.log('\x1b[36m[⬢ Archive output directory]\x1b[0m', results.directory);
        })
      console.log("\x1b[36m[⬢ GAME]\x1b[0m Masoi installation is complete > restarting...")
    }).catch(console.log).finally(async () => {
      await global.restart()
    })
  }
}

const getUname = (ID) => global.data.users.get(ID).info.name;

async function masoiLoader() {
  const d = await import(masoiGamePath + "/index.js");
  global.gameManager.import({ "masoi": d.default })
}

const onCall = async ({ message, args, prefix }) => {
  if (!global.gameManager) {
    return console.log("chua cai plugin game.js: https://github.com/Citnut/xvagame/blob/main/game.js")
  }
  if (!global.gameManager.isValid(config.name)) { await masoiLoader() }
  global.gameManager.run(config.name, {
    masterID: message.senderID,
    threadID: message.threadID,
    param: args,
    isGroup: message.isGroup,
    send: message.send,
    prefix,
    getUname
  })
}
export default {
  config,
  onLoad,
  onCall,
  onLoad() {
    if (!global.gameLoader) global.gameLoader = [];
    global.gameLoader.push(masoiLoader)
  }
}
