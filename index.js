const moment = require("moment");
moment.locale("ko");

const bot = new (require("./bot.js"))();
const requester = new (require("./requester"))();
const parser = new (require("./parser"))();
const storage = new (require("./storage"))();

let today = new Date();

bot.sendMessageAdmin(moment().format("YYYY-MM-DD HH:mm:ss") + " Start.");

requester.load().then(data => {
  let lastTimestamp = parseInt(storage.readUpdateDate());
  let currentTimestamp = parser.getUpdateDate(data).getTime();

  if (currentTimestamp !== lastTimestamp) {
    let currentDate = moment(currentTimestamp).subtract(1, "months");
    let timeMessage = currentDate.format("YYYY년 MM월 DD일 A hh시") + "\n";
    let statusMessage = parser
      .getStatus(data)
      .map(arr => {
        return arr[0] + " " + arr[1] + "명";
      })
      .join("\n");

    console.log(timeMessage + statusMessage);

    bot.sendMessage(timeMessage + statusMessage);
    storage.saveUpdateDate(currentTimestamp);
  }
});
