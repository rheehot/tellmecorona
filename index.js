const bot = new (require("./bot.js"))();
const requester = new (require("./requester"))();
const parser = new (require("./parser"))();
const storage = new (require("./storage"))();

let today = new Date();

bot.sendMessageAdmin(
  `${today.getFullYear()}-${today.getMonth()}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()} Start.`
);

requester.load().then(data => {
  let lastTimestamp = parseInt(storage.readUpdateDate());
  let currentTimestamp = parser.getUpdateDate(data).getTime();

  if (currentTimestamp !== lastTimestamp) {
    let currentDate = new Date(currentTimestamp);
    let ampm = currentDate.getHours() > 12 ? "오후" : "오전";
    let hours =
      ampm === "오후" ? currentDate.getHours() - 12 : currentDate.getHours();
    let timeMessage = `${currentDate.getFullYear()}년 ${currentDate.getMonth()}월 ${currentDate.getDate()}일 ${ampm} ${hours}시\n`;
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
