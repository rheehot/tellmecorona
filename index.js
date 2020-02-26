const moment = require("moment");
const _ = require("lodash");
const db = new (require("./database/mysql"))();
moment.locale("ko");

const bot = new (require("./bot.js"))();
const requester = new (require("./requester"))();
const parser = new (require("./parser"))();

bot.sendMessageAdmin(moment().format("YYYY-MM-DD HH:mm:ss") + " Start.");

requester.load().then(data => {
  let currentTimestamp = parser.getUpdateDate(data).getTime();

  db.getRecentLog(recentLog => {
    let lastTimestamp = new Date(recentLog.date).getTime();

    if (currentTimestamp !== lastTimestamp) {
      let currentDate = moment(currentTimestamp);
      let timeMessage = currentDate.format("YYYY년 MM월 DD일 A hh시") + "\n";
      let status = parser.getStatus(data);
      let statusMessage = status
        .map(item => {
          let result = item.data.title + " " + item.data.displayValue + "명";

          if (item.data.value > 0) {
            result += `(+${item.data.value - recentLog[item.key]})`;
          }

          return result;
        })
        .join("\n");

      let infectedItem = _.find(status, { key: "infected" });
      let testedItem = _.find(status, { key: "tested" });
      let recoveredItem = _.find(status, { key: "recovered" });
      let deathsItem = _.find(status, { key: "deaths" });

      db.addLog(
        currentDate.format("YYYY-MM-DD HH:mm:ss"),
        infectedItem.data.value,
        recoveredItem.data.value,
        deathsItem.data.value,
        testedItem.data.value
      );

      console.log(timeMessage + statusMessage);
      bot.sendMessage(timeMessage + statusMessage);
    }
  });

  db.end();
});
