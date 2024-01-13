import { createWriteStream, createReadStream, unlinkSync, statSync, existsSync, mkdirSync, writeFileSync } from "fs";
import ytdl from "ytdl-core";
import axios from "axios";
import moment from "moment-timezone";
import { GetListByKeyword } from "youtube-search-api"
async function downloadMusicFromYoutube(link, path) {
  if (!link) return 'Thiếu link'
  return new Promise(function (resolve, reject) {
    const timestart = Date.now();
    ytdl(link, { filter: "audioonly" })
      .pipe(createWriteStream(path))
      .on("close", async () => {
        let data = await ytdl.getInfo(link)
        let result = {
          title: data.videoDetails.title,
          dur: Number(data.videoDetails.lengthSeconds),
          viewCount: data.videoDetails.viewCount,
          likes: data.videoDetails.likes,
          uploadDate: data.videoDetails.uploadDate,
          sub: data.videoDetails.author.subscriber_count,
          author: data.videoDetails.author.name,
          timestart: timestart
        }
        resolve(result)
      })
      .on("error", reject)
  });
}
const dirname = global.pluginsPath + "/commands/cache/sing"
if (!existsSync(dirname)) mkdirSync(dirname)
async function handleReply({ message, eventData }) {
  try {
    const msgRl = eventData.data
    const path = `${dirname}/${message.senderID}.mp3`
    const data = await downloadMusicFromYoutube('https://www.youtube.com/watch?v=' + msgRl.link[message.body - 1], path);
    if (statSync(path).size > 26214400) return message.reply('𝗞𝗵𝗼̂𝗻𝗴 𝘁𝗵𝗲̂̉ 𝗴𝘂̛̉𝗶 𝗳𝗶𝗹𝗲. 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗰𝗵𝗼̣𝗻 𝗯𝗮̀𝗶 𝗵𝗮́𝘁 𝗸𝗵𝗮́𝗰!').then(() => unlinkSync(path));
    return message.reply({
      body: `🎶=====「 𝐌𝐔𝐒𝐈𝐂 」=====️🎶\n━━━━━━━━━━━━━━\n📌 → 𝗧𝗶𝘁𝗹𝗲: ${data.title} ( ${convertHMS(data.dur)} )\n📆 → 𝗡𝗴𝗮̀𝘆 𝘁𝗮̉𝗶 𝗹𝗲̂𝗻: ${data.uploadDate}\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.author} ( ${data.sub} )\n👀 → 𝗟𝘂̛𝗼̛̣𝘁 𝘅𝗲𝗺: ${data.viewCount} 𝘃𝗶𝗲𝘄\n❤️ → 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗵𝗶́𝗰𝗵: ${data.likes}\n🔗 →  𝗟𝗶𝗻𝗸 𝘁𝗮̉𝗶: https://www.y2meta[.]com/vi/youtube/${msgRl.link[message.body - 1]}\n⏳ → 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘅𝘂̛̉ 𝗹𝘆́: ${Math.floor((Date.now() - data.timestart) / 1000)} 𝗴𝗶𝗮̂𝘆\n======= [ ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")} ] =======`,
      attachment: createReadStream(path)
    }).then(() => {
      unlinkSync(path);
      global.api.unsendMessage(msgRl.messageID)
    })

  }
  catch { console.log }
}
const convertHMS = value => {
  const sec = parseInt(value, 10);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - (hours * 3600)) / 60);
  let seconds = sec - (hours * 3600) - (minutes * 60);
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return (hours != '00' ? hours + ':' : '') + minutes + ':' + seconds;
}
function getVidId(text) {
  const urlPatten = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
  const isValidUrl = urlPatten.test(text);
  if (isValidUrl) {
    let videoID = text.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (videoID[2] !== undefined) ? videoID = videoID[2].split(/[^0-9a-z_\-]/i)[0] : videoID = videoID[0];
  }
  return false;
}
async function onCall({ message, args }) {
  if (args.length == 0 || !args) return message.reply('» 𝗣𝗵𝗮̂̀𝗻 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝗸𝗵𝗼̂𝗻𝗴 đ𝘂̛𝗼̛̣𝗰 đ𝗲̂̉ 𝘁𝗿𝗼̂́𝗻𝗴!');
  const keywordSearch = args.join(" ");
  let path = `${dirname}/${message.senderID}.mp3`
  if (existsSync(path)) unlinkSync(path)
  const vidID = getVidId(keywordSearch)
  if (vidID) {
    try {
      let data = await downloadMusicFromYoutube(keywordSearch, path);
      if (statSync(path).size > 2621440000) return message.reply('𝗞𝗵𝗼̂𝗻𝗴 𝘁𝗵𝗲̂̉ 𝗴𝘂̛̉𝗶 𝗳𝗶𝗹𝗲 𝗰𝗼́ 𝘁𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘁𝘂̛̀ 01:10:10 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗰𝗵𝗼̣𝗻 𝗳𝗶𝗹𝗲 𝗸𝗵𝗼̂𝗻𝗴 𝗰𝗼́ 𝗮̂𝗺 𝘁𝗵𝗮𝗻𝗵.').then(() => unlinkSync(path));
      return message.reply({
        body: `🎶=====「 𝐌𝐔𝐒𝐈𝐂 」=====️🎶\n━━━━━━━━━━━━━━\n📌 → 𝗧𝗶𝘁𝗹𝗲: ${data.title} ( ${convertHMS(data.dur)} )\n📆 → 𝗡𝗴𝗮̀𝘆 𝘁𝗮̉𝗶 𝗹𝗲̂𝗻: ${data.uploadDate}\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${data.author} ( ${data.sub} )\n👀 → 𝗟𝘂̛𝗼̛̣𝘁 𝘅𝗲𝗺: ${data.viewCount} 𝘃𝗶𝗲𝘄\n❤️ → 𝗟𝘂̛𝗼̛̣𝘁 𝘁𝗵𝗶́𝗰𝗵: ${data.likes}\n⏳ → 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘅𝘂̛̉ 𝗹𝘆́: ${Math.floor((Date.now() - data.timestart) / 1000)} 𝗴𝗶𝗮̂𝘆\n🔗 →  𝗟𝗶𝗻𝗸 𝘁𝗮̉𝗶: https://www.y2meta.com/vi/youtube/${vidID}\n======= [ ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")} ] =======`,
        attachment: createReadStream(path)
      }).then(() => unlinkSync(path))

    }
    catch (e) { return console.log(e) }
  } else {
    try {
      let link = [],
        msg = "",
        num = 0,
        num1 = "",
        numb = 0;
      let imgthumnail = []
      let data = (await GetListByKeyword(keywordSearch, false, 6)).items;
      for (let value of data) {
        link.push(value.id);
        let folderthumnail = `${dirname}/${numb += 1}.png`;
        let linkthumnail = `https://img.youtube.com/vi/${value.id}/hqdefault.jpg`;
        let getthumnail = (await axios.get(`${linkthumnail}`, {
          responseType: 'arraybuffer'
        })).data;
        let datac = (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${value.id}&key=AIzaSyANZ2iLlzjDztWXgbCgL8Oeimn3i3qd0bE`)).data;
        writeFileSync(folderthumnail, Buffer.from(getthumnail, 'utf-8'));
        imgthumnail.push(createReadStream(`${dirname}/${numb}.png`));
        let channel = datac.items[0].snippet.channelTitle;
        num++;
        if (num == 1) num1 = "𝟙. "
        if (num == 2) num1 = "𝟚. "
        if (num == 3) num1 = "𝟛. "
        if (num == 4) num1 = "𝟜. "
        if (num == 5) num1 = "𝟝. "
        if (num == 6) num1 = "𝟞. "

        msg += (`${num1} - ${value.title} ( ${value.length.simpleText} )\n📻 → 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${channel}\n━━━━━━━━━━━━━━\n`);
      }
      let body = `»🔎 𝐂𝐨́ ${link.length} 𝐤𝐞̂́𝐭 𝐪𝐮𝐚̉ 𝐭𝐫𝐮̀𝐧𝐠 𝐯𝐨̛́𝐢 𝐭𝐮̛̀ 𝐤𝐡𝐨𝐚́ 𝐭𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧:\n━━━━━━━━━━━━━━\n${msg}» 𝐇𝐚̃𝐲 𝐫𝐞𝐩𝐥𝐲 (𝐩𝐡𝐚̉𝐧 𝐡𝐨̂̀𝐢) 𝐜𝐡𝐨̣𝐧 𝐦𝐨̣̂𝐭 𝐭𝐫𝐨𝐧𝐠 𝐧𝐡𝐮̛̃𝐧𝐠 𝐭𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦 𝐭𝐫𝐞̂𝐧`
      return message.reply({
        attachment: imgthumnail,
        body
      }).then(d => d.addReplyEvent({
        callback: handleReply, data: {
          type: 'reply',
          messageID: d.messageID,
          author: message.senderID,
          link
        }
      }));
    } catch (e) {
      return message.reply('Đã xảy ra lỗi, vui lòng thử lại trong giây lát!!\n' + e);
    }
  }
}
const config = {
  name: "sing",
  version: "1.0.0",
  credits: "D-Jukie, convert to Xavia by Citnut",
  description: "Phát nhạc thông qua link YouTube hoặc từ khoá tìm kiếm",
  // commandCategory: "Tiện ích",
  usage: "[searchMusic]",
  cooldowns: 5
}
export default {
  config,
  onCall
}
