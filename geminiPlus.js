const usage = ["new", "menu", "on", "off"]
const config = {
  name: "geminiplus",
  aliases: ["ggp"],
  description: "Tính năng history chat cho gemini AI",
  usage: `<${usage.join(" || ")}>`,
  cooldown: 5,
  permissions: [0, 1, 2],
  credits: "Citnut",
  extra: {}
}

function newChat() {
  return {
    history: [
      // {
      //   role: "user",
      //   parts: [{ text: "Hello, I have 2 dogs in my house." }],
      // },
      // {
      //   role: "model",
      //   parts: [{ text: "Great to meet you. What would you like to know?" }],
      // },
    ],
    chat: undefined
  }
}
const menu = (chatHistory, num, index) => `=== Gemini AI chat menu ===\n - Chat history: ${chatHistory ? "on" : "off"}\n - Số cuộc trò truyện của bạn: ${num}\n - Bạn đang ở trong cuộc trò truyện số: ${index}`
const remote = list => `\nĐể chọn một đoạn chat:\n${list}\n - Reply tin nhắn này với số thứ tự tương ứng`
const mvSuccess = index => `Đã di chuyển tới đoạn chat số ${index}`
/**
 * 
 * @type {TOnCallCommand}
 */
async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
  const input = args.join(" ")
  switch (input) {
    case usage[0]:
      if (!global.geminiAuto.history[message.senderID]) {
        global.geminiAuto.history[message.senderID] = [true, [newChat()], 0]
      } else {
        global.geminiAuto.history[message.senderID][1].push(newChat())
      }
      break;
    case usage[1]:
      if (!global.geminiAuto.history[message.senderID]) {
        message.reply(menu(false, 0, 0))
      } else
        if (global.geminiAuto.history[message.senderID][1].length <= 1) {
          message.reply(menu(global.geminiAuto.history[message.senderID][0], global.geminiAuto.history[message.senderID][1].length, global.geminiAuto.history[message.senderID][2] + 1))
        } else {
          let list = []
          for (let i = 0; i < global.geminiAuto.history[message.senderID][1].length; i++) {
            list.push(`[${i}]`)
          }
          const e = await message.reply(menu(global.geminiAuto.history[message.senderID][0], global.geminiAuto.history[message.senderID][1].length, global.geminiAuto.history[message.senderID][2] + 1) + remote(list.join(" ")))
          const uID = message.senderID
          e.addReplyEvent({
            callback: ({ message: msg }) => {
              if (msg.senderID !== uID) return;
              let choose = Number(msg.body)
              if (!choose) return;
              if (choose < 0 || choose >= global.geminiAuto.history[uID][1].length) return;
              global.geminiAuto.history[uID][2] = choose
              e.unsend()
              msg.send(mvSuccess(choose))
            }
          })
        }
      break;
    case usage[2]:
      if (global.geminiAuto.history[message.senderID]) {
        global.geminiAuto.history[message.senderID][0] = true
      }
      break;
    case usage[3]:
      if (global.geminiAuto.history[message.senderID]) {
        global.geminiAuto.history[message.senderID][0] = false
      }
      break;
    default:
      let text = "";
      if (!global.geminiAuto.history[message.senderID]) global.geminiAuto.history[message.senderID] = [true, [newChat()], 0];
      text = await global.geminiGetText(input, message.senderID);
      if (!global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].chat) {
        global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].history.push(global.geminiAuto.newHistory("user", input), global.geminiAuto.newHistory("model", text));
        global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].chat = global.geminiAuto.model.startChat({
          history: global.geminiAuto.history[message.senderID][1][global.geminiAuto.history[message.senderID][2]].history,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        })
      };
      await message.reply(text);
      break;
  }
}
export default {
  config,
  onCall
}