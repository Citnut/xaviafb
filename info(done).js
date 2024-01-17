import axios from 'axios'
import { writeFileSync, createReadStream } from 'fs'

export const config = {
  name: "info",
  credits: "Vtuan convert to Xavia and fix by Citnut",
  description: "Xem thông tin người dùng",
  commandCategory: "Nhóm",
  usage: "[tag/reply/id]",
  cooldowns: 5
}
const pathAvt1 = uid => `${global.cachePath}/${uid}_avt.jpg`


export async function onCall({ message, args }) {
  let uid

  if (args.length > 0) {
    uid = args.join().indexOf("@") !== -1 ? Object.keys(message.mentions)[0] : uid = args[0]
  } else uid = (message.type === "message_reply") ? message.messageReply.senderID : message.senderID

  try {
    const response = await axios.get(`https://sumiproject.io.vn/facebook/getinfo?uid=${uid}&apikey=APIKEY_FREE`)
    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
    const avatarBuffer = (await axios.get(avatarURL, { responseType: 'arraybuffer' })).data
    writeFileSync(pathAvt1(uid), Buffer.from(avatarBuffer, "utf-8"))
    let workInfo = ""
    if (response.data.work && response.data.work.length > 0) {
      workInfo = `-Công Việc:
+Làm việc tại: ${response.data.work[0].employer.name}
+Ngày bắt đầu: ${response.data.work[0].start_date}
+Bio: ${response.data.work[0].description}
+Vị trí/chức vụ: ${response.data.work[0].position.name}
      `
    }

    message.reply({
      body: `
== [ Info User] ==
Name: ${response.data.name}
Link profile: ${response.data.link_profile}
Uid: ${response.data.uid}
First name: ${response.data.first_name}
Username: ${response.data.username}
Ngày tạo acc: ${response.data.created_time}
Trang web: ${response.data.web}
Giới tính: ${response.data.gender}
Hẹn hò: ${response.data.relationship_status}
Love: ${response.data.love ? response.data.love.name : "Không có thông tin"}
Sinh nhật: ${response.data.birthday === "Sinh nhật private" ? "Không công khai" : response.data.birthday}
Số follower: ${response.data.follower}
Tích xanh: ${response.data.tichxanh ? "Có" : "Không"}
Ngôn ngữ: ${response.data.locale}
Sống ở: ${response.data.location ?? "Không công khai"}
Quê hương: ${response.data.hometown ?? "Không công khai"}
${workInfo}
      `,
      attachment: createReadStream(pathAvt1(uid))
    })

  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu đến API:', error)
    message.reply(`Đã xảy ra lỗi khi gửi yêu cầu đến API.`)
  }
}