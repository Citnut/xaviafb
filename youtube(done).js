const config = {
    name: 'youtube',
    version: '1.0.0',
    credits: 'DungUwU, convert to Xavia by Citnut',
    description: 'Phát nhạc hoặc video thông qua link YouTube hoặc từ khoá tìm kiếm',
    // commandCategory: 'Tiện ích',
    usage: '< keyword/url >',
    cooldowns: 5
};
const key = process.env.YTB_API_KEY || "AIzaSyBNqRSYmQ9D1WWIa186k8nSvo5mr2Rvk5M";
import { existsSync, mkdirSync, createWriteStream, createReadStream, unlinkSync, statSync } from "fs";
import request from "request";
import axios from "axios";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
ffmpeg.setFfmpegPath(ffmpegPath);
const dirname = process.cwd() + "/plugins/commands/cache"
const dirMaterial = dirname + `/youtube/`;
function onLoad() {
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(dirMaterial + "ytb.jpeg")) request("https://i.imgur.com/CqgfBW8.jpeg").pipe(createWriteStream(dirMaterial + "ytb.jpeg"));
}
const downloadMedia = async (videoID, type, senderID) => {
    const filePath = `${dirMaterial}${Date.now()}${senderID}.${(type == 'video') ? 'mp4' : 'm4a'}`;
    const errObj = {
        filePath,
        error: 1
    };
    try {
        const mediaObj = {
            filePath,
            error: 0
        }

        let ytdlOptions;

        type == 'video' ? ytdlOptions = { quality: '18' } : ytdlOptions = { filter: 'audioonly' };

        await new Promise((resolve, reject) => {
            const startTime = Date.now();
            const stream = ytdl('https://www.youtube.com/watch?v=' + videoID, ytdlOptions)

            type == 'video' ? stream
                .pipe(createWriteStream(filePath))
                .on('error', (err) => {
                    reject(err);
                })
                .on('close', () => {
                    resolve()
                })
                : ffmpeg(stream)
                    .audioCodec("aac")
                    // .bitrate(128)
                    .save(filePath)
                    .on("error", err => {
                        reject(err);
                    })
                    .on("end", () => {
                        console.log('Đã tải xuống, chuyển đổi trong ' + (Date.now() - startTime) + 'ms');
                        resolve();
                    })
        });

        return mediaObj;
    } catch (e) {
        console.log(e)
        return errObj;
    }
}
async function handleReply({ message, eventData }) {
    const { body, senderID } = message;
    const { author, videoID, IDs, reply_type } = eventData.data;
    if (senderID != author) return;
    global.api.unsendMessage(eventData.data.messageID)
    switch (reply_type) {
        case 'download':
            const { filePath, error } = await downloadMedia(videoID, body == '1' ? 'video' : 'audio', senderID);
            const mediaData = {
                title: (await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${key}`)).data.items[0].snippet.title,
                duration: prettyTime((await axios.get(encodeURI(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${key}`))).data.items[0].contentDetails.duration)
            }
            if (error != 0) {
                message.reply('→ Đã có lỗi xảy ra');
                if (existsSync(filePath)) unlinkSync(filePath);
            } else {
                if ((statSync(filePath).size > 50331648 && body == 1) || (statSync(filePath).size > 26214400 && body == 2)) {
                    message.reply('→ Không thể gửi vì kích thước tệp quá lớn');
                    unlinkSync(filePath);
                } else {
                    await message.reply({
                        body: `=====『 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 』=====\n\n→ 𝗧𝗶𝗲̂𝘂 đ𝗲̂̀: ${mediaData.title}\n→ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${mediaData.duration}`,
                        attachment: createReadStream(filePath)
                    }).catch(e => {
                        console.log(e);
                        message.send('→ Đã có lỗi xảy ra');
                        if (existsSync(filePath)) unlinkSync(filePath);
                    }).then(() => {
                        unlinkSync(filePath);
                    })
                }
            }
            break;
        case 'list':
            if (isNaN(body) || body < 1 || body > IDs.length) {
                message.reply('→ Vui lòng chọn số từ 1 đến ' + IDs.length);
            } else {
                const chosenIndex = parseInt(body) - 1;
                const chosenID = IDs[chosenIndex];
                message.reply('====『 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗟𝗨̛̣𝗔 𝗖𝗛𝗢̣𝗡 』====\n𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗽𝗵𝗮̉𝗻 𝗵𝗼̂̀𝗶 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝘃𝗼̛́𝗶 𝗰𝗮́𝗰 𝗹𝘂̛̣𝗮 𝗰𝗵𝗼̣𝗻 𝗱𝘂̛𝗼̛́𝗶 đ𝗮̂𝘆:\n\n𝟭. 𝗧𝗮̉𝗶 𝘃𝗶𝗱𝗲𝗼 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻 𝗰𝗵𝗼̣𝗻 𝗯𝗲̂𝗻 𝘁𝗿𝗲̂𝗻 ❤️\n𝟮. 𝗧𝗮̉𝗶 𝗮̂𝗺 𝘁𝗵𝗮𝗻𝗵 𝗰𝘂̉𝗮 𝘃𝗶𝗱𝗲𝗼 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻 𝗰𝗵𝗼̣𝗻 𝗽𝗵𝗶́𝗮 𝘁𝗿𝗲̂𝗻 💙')
                    .catch(console.log)
                    .then(d => d.addReplyEvent({
                        callback: handleReply, data: {
                            reply_type: 'download',
                            author: senderID,
                            messageID: d.messageID,
                            videoID: chosenID
                        }
                    }))
            }
            break;
    }
}
const getBasicInfo = async (keyword) => (await axios.get(encodeURI(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${keyword}&type=video&key=${key}`))).data.items;
const onCall = async function ({ message, args }) {
    const { senderID } = message;
    if (args.length == 0) return message.reply('→ Phần tìm kiếm không được để trống');
    const input = args.join(' ');
    const urlPatten = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
    const isValidUrl = urlPatten.test(input);
    try {
        if (isValidUrl) {
            let videoID = input.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            (videoID[2] !== undefined) ? videoID = videoID[2].split(/[^0-9a-z_\-]/i)[0] : videoID = videoID[0];
            message.reply('====『 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗟𝗨̛̣𝗔 𝗖𝗛𝗢̣𝗡 』====\n𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗽𝗵𝗮̉𝗻 𝗵𝗼̂̀𝗶 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝘃𝗼̛́𝗶 𝗰𝗮́𝗰 𝗹𝘂̛̣𝗮 𝗰𝗵𝗼̣𝗻 𝗱𝘂̛𝗼̛́𝗶 đ𝗮̂𝘆:\n\n𝟭. 𝗧𝗮̉𝗶 𝘃𝗶𝗱𝗲𝗼 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻 𝗰𝗵𝗼̣𝗻 𝗯𝗲̂𝗻 𝘁𝗿𝗲̂𝗻 ❤️\n𝟮. 𝗧𝗮̉𝗶 𝗮̂𝗺 𝘁𝗵𝗮𝗻𝗵 𝗰𝘂̉𝗮 𝘃𝗶𝗱𝗲𝗼 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻 𝗰𝗵𝗼̣𝗻 𝗽𝗵𝗶́𝗮 𝘁𝗿𝗲̂𝗻 💙')
                .then(d => d.addReplyEvent({
                    callback: handleReply, data: {
                        reply_type: 'download',
                        author: senderID,
                        messageID: d.messageID,
                        videoID
                    }
                }))
                .catch(console.log)
        } else {
            let IDs = [],
                msg = "",
                msgg = "",
                result = await getBasicInfo(input);
            for (let i = 0; i < result.length; i++) {
                const id = result[i].id.videoId;
                if (id !== undefined) {
                    IDs.push(id);
                    const mediaDuration = (await axios.get(encodeURI(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`))).data.items[0].contentDetails.duration;
                    msg += `\n━━━━━━━━━━━━━━━━━━\n${i + 1}. ${result[i].snippet.title}\n→ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘃𝗶𝗱𝗲𝗼: ${prettyTime(mediaDuration)}`;
                }
            }
            msgg = `→ 𝗖𝗼́ ${IDs.length} 𝗸𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝘁𝗿𝘂̀𝗻𝗴 𝘃𝗼̛́𝗶 𝘁𝘂̛̀ 𝗸𝗵𝗼𝗮́ 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻:${msg}\n━━━━━━━━━━━━━━━━━━\n→ 𝗛𝗮̃𝘆 𝗽𝗵𝗮̉𝗻 𝗵𝗼̂̀𝗶 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝗰𝗵𝗼̣𝗻 𝗺𝗼̣̂𝘁 𝘁𝗿𝗼𝗻𝗴 𝗻𝗵𝘂̛̃𝗻𝗴 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝘁𝗿𝗲̂𝗻`
            message.send(msgg).then(d => d.addReplyEvent({
                callback: handleReply, data: {
                    reply_type: 'list',
                    author: senderID,
                    messageID: d.messageID,
                    IDs
                }
            })).catch(console.log)
        }
    } catch { console.log };
    return;
}
const prettyTime = (time) => {
    let newTimeArray = [];
    time = time.slice(2);
    if (time.includes('H')) {
        newTimeArray.push(time.split('H')[0]);
        time = time.split('H')[1];
    } else newTimeArray.push(0);
    if (time.includes('M')) {
        newTimeArray.push(time.split('M')[0]);
        time = time.split('M')[1];
    } else newTimeArray.push(0);
    if (time.includes('S')) {
        newTimeArray.push(time.split('S')[0]);
    } else newTimeArray.push(0);
    newTimeArray = newTimeArray.map(item => {
        if (parseInt(item) < 10) {
            return '0' + item;
        } else return item;
    })
    return newTimeArray.join(':');
}
export default {
    config,
    onLoad,
    onCall
}
