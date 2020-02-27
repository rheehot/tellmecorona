const moment = require('moment')
const _ = require('lodash')
const db = new (require('./database/mysql'))()
moment.locale('ko')

const bot = new (require('./bot.js'))()
const requester = new (require('./requester'))()
const parser = new (require('./parser'))()

bot.sendStartMessage()

requester.load().then((data: any) => {
  let currentTimestamp: number = parser.getUpdateDate(data).getTime()

  db.getRecentLog((recentLog: any) => {
    let lastTimestamp: number = new Date(recentLog.date).getTime()

    console.log(currentTimestamp, lastTimestamp)

    if (currentTimestamp !== lastTimestamp) {
      let currentDate: any = moment(currentTimestamp)
      let timeMessage: string =
        currentDate.format('YYYY년 MM월 DD일 A hh시') + '\n'
      let status: object[] | null = parser.getStatus(data)

      if (status !== null) {
        let statusMessage: string = status
          .map((item: any) => {
            let result: string =
              item.data.title + ' ' + item.data.displayValue + '명'
            let increment: number = item.data.value - recentLog[item.key]

            if (increment > 0) {
              result += `(+${increment})`
            }

            return result
          })
          .join('\n')

        let infectedItem: any = _.find(status, { key: 'infected' })
        let testedItem: any = _.find(status, { key: 'tested' })
        let recoveredItem: any = _.find(status, { key: 'recovered' })
        let deathsItem: any = _.find(status, { key: 'deaths' })

        db.addLog(
          currentDate.format('YYYY-MM-DD HH:mm:ss'),
          infectedItem.data.value,
          recoveredItem.data.value,
          deathsItem.data.value,
          testedItem.data.value
        )

        console.log(timeMessage + statusMessage)
        bot.sendMessage(timeMessage + statusMessage)
      }
    }

    db.end()
  })
})
