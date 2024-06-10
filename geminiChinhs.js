import { GoogleGenerativeAI } from "@google/generative-ai"
import { existsSync, writeFileSync } from "fs"
const geminikey = ""
const geminiAutoPath = "/onMessage/geminiAuto.js"
const ea = "your thread is not a group!"
const AI = new GoogleGenerativeAI(process.env.GEMINIKEY || geminikey)
const model = AI.getGenerativeModel({ model: "gemini-pro" })

const config = {
  name: "gemini",
  aliases: ["gg"],
  description: "ahihi",
  usage: "<text> || <nopre a || o || stt >\n - 'nopre a' để bật/tắt chế độ nopre cho nhóm này\n - 'nopre o hoặc nopre' để bật/tắt chế độ nopre cho bản thân bạn\n - 'nopre stt' để xem trạng thái bật/tắt nopre ",
  cooldown: 5,
  permissions: [0, 1, 2],
  credits: "Citnut",
  extra: {}
}
const onoff = conditions => conditions ? "on" : "off"
/**
 * 
 * @type {TOnCallCommand}
 */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  // all one
  if (args[0] == "nopre") {
    switch (args[1]) {
      case 'a':
        if (!message.isGroup) return message.reply(ea)
        if (!global.geminiAuto.aID[message.threadID]) {
          global.geminiAuto.aID[message.threadID] = true
        } else {
          global.geminiAuto.aID[message.threadID] = !global.geminiAuto.aID[message.threadID]
        }
        break;
      case 'stt':
        message.reply(`=== nopre status ===\n- Box: ${onoff(global.geminiAuto.aID[message.threadID])}\n- Your self: ${onoff(global.geminiAuto.oID[message.senderID])}`)
        break;
      default:
        if (!global.geminiAuto.oID[message.senderID]) {
          global.geminiAuto.oID[message.senderID] = true
        } else {
          global.geminiAuto.oID[message.senderID] = !global.geminiAuto.oID[message.senderID]
        }
        break;
    }
  } else {
    const promt = args.join(" ")
    const result = (await model.generateContent(promt)).response.text()
    await message.reply(result)
  }
}
/**
 * @type {TOnLoadCommand}
 */
function onLoad() {
  if (!global.geminiAuto) {
    global.geminiAuto = {
      model: model,
      regExp: /[!@#$%^&*(),.?":{}|<>\-+=~;]/,
      aID: {},
      oID: {},
      history: {},
      newHistory: (role, text) => ({ role: role, parts: [{ text: text }] })
    }
  }
  if (!existsSync(global.pluginsPath + geminiAutoPath)) {
    writeFileSync(global.pluginsPath + geminiAutoPath, `async function getText(promt, uID) {
          let result = 'err...';
          if (global.geminiAuto.history[uID]) {
            if (global.geminiAuto.history[uID][0] && global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].chat) {
              result = (await global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].chat.sendMessage(promt)).response.text();
              if (!result) {
                global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].chat = global.geminiAuto.model.startChat({
                  history: global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].history,
                  generationConfig: {
                    maxOutputTokens: 1000,
                  },
                });
                result = (await global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].chat.sendMessage(promt)).response.text();
              } else {
                global.geminiAuto.history[uID][1][global.geminiAuto.history[uID][2]].history = [global.geminiAuto.newHistory("user", promt), global.geminiAuto.newHistory("model", result)];
              }
              return result;
            }
          }
          result = (await global.geminiAuto.model.generateContent(promt)).response.text();
          return result;
        };
        global.geminiGetText = getText;
        export default async function ({ message, args, getLang, extra, data, userPermissions, prefix }) {
          if (((message.senderID == global.botID) || message.body.startsWith(prefix)) || (global.geminiAuto.regExp.test(message.body) || message.body.startsWith("/"))) return;
          let text = '';
          if (global.geminiAuto.aID[message.threadID]) {
            if (!message.isGroup) return;
            text = await getText(message.body, message.senderID);
            await message.reply(text);
          } else {
            if (global.geminiAuto.oID[message.senderID]) {
              text = await getText(message.body, message.senderID);
              await message.reply(text);
            };
          };
          if (!text) return;
          if (!global.geminiAuto.history[message.senderID]) return;
          if (!global.geminiAuto.history[message.senderID][0] || global.geminiAuto.history[message.senderID][1].length < 1 || global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].history.length != 0) return;
          global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].history.push(global.geminiAuto.newHistory("user", message.body), global.geminiAuto.newHistory("model", text));
          global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].chat = global.geminiAuto.model.startChat({
            history: global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].history,
            generationConfig: {
              maxOutputTokens: 1000,
            },
          })
        }
        `)
  }
}
export default {
  config,
  onCall,
  onLoad
}