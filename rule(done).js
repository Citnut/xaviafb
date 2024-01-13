const config = {
    name: "rule",
    aliases: ["rule2"],
    version: "1.0.1",
    permissions: [1, 2],
    credits: "CatalizCS, convert to Xavia by Citnut",
    description: "Tùy biến luật cho từng group",
    // commandCategory: "Box Chat",
    usage: "[add/remove/all] [content/ID]",
    cooldowns: 5,
}
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "fs"
function onLoad() {
    const pathData = global.pluginsPath + "/commands/cache/rules"
    const ruleFile = pathData + "/data.json"
    if (!existsSync(pathData)) {
        mkdirSync(pathData);
        writeFileSync(ruleFile, "[]", "utf-8");
    }
}

const onCall = ({ message, args, userPermissions }) => {
    const { threadID } = message;

    const content = (args.slice(1, args.length)).join(" ");
    let dataJson = JSON.parse(readFileSync(ruleFile, "utf-8"));
    let thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, listRule: [] };

    switch (args[0]) {
        case "add": {
            if (userPermissions == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Bạn không đủ quyền hạn để có thể sử dụng thêm luật!");
            if (content.length == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Phần nhập thông tin không được để trống");
            if (content.indexOf("\n") != -1) {
                const contentSplit = content.split("\n");
                for (const item of contentSplit) thisThread.listRule.push(item);
            }
            else {
                thisThread.listRule.push(content);
            }
            writeFileSync(ruleFile, JSON.stringify(dataJson, null, 4), "utf-8");
            message.reply('[ 𝗥𝗨𝗟𝗘 ] - Đã thêm luật mới cho nhóm thành công!');
            break;
        }
        case "list":
        case "all": {
            let msg = "", index = 0;
            for (const item of thisThread.listRule) msg += `${index += 1}/ ${item}\n`;
            if (msg.length == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Nhóm của bạn hiện tại chưa có danh sách luật để hiển thị!");
            message.reply(`📜=== 𝐋𝐔𝐀̣̂𝐓 𝐂𝐔̉𝐀 𝐍𝐇𝐎́𝐌 ===📜\n\n${msg}`);
            break;
        }
        case "rm":
        case "remove":
        case "delete": {
            if (!isNaN(content) && content > 0) {
                if (userPermissions == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Bạn không đủ quyền hạn để có thể sử dụng xóa luật!");
                if (thisThread.listRule.length == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Nhóm của bạn chưa có danh sách luật để có thể xóa!");
                thisThread.listRule.splice(content - 1, 1);
                message.reply(`[ 𝗥𝗨𝗟𝗘 ] - Đã xóa thành công luật có số thứ tự thứ ${content}`);
                break;
            }
            else if (content == "all") {
                if (userPermissions == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Bạn không đủ quyền hạn để có thể sử dụng xóa luật!");
                if (thisThread.listRule.length == 0) return message.reply("[ 𝗥𝗨𝗟𝗘 ] - Nhóm của bạn chưa có danh sách luật để có thể xóa!");
                thisThread.listRule = [];
                message.reply(`[ 𝗥𝗨𝗟𝗘 ] - Đã xóa thành công toàn bộ luật của nhóm!`);
                break;
            }
        }
        default: {
            if (thisThread.listRule.length != 0) {
                let msg = "", index = 0;
                for (const item of thisThread.listRule) msg += `${index += 1}/ ${item}\n`;
                return message.reply(`📜=== 𝐋𝐔𝐀̣̂𝐓 𝐂𝐔̉𝐀 𝐍𝐇𝐎́𝐌 ===📜\n\n${msg} \n[ Việc tuân thủ luật của nhóm sẽ đóng góp tích cực đến cộng động của bạn ]`);
            }
            return;
        }
    }

    if (!dataJson.some(item => item.threadID == threadID)) dataJson.push(thisThread);
    return writeFileSync(ruleFile, JSON.stringify(dataJson, null, 4), "utf-8");
}

export default {
    config,
    onLoad,
    onCall
}
