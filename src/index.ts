const _ = require('lodash')
const moment = require('moment')

const TelegramAPI = new (require('./telegram.js'))()
const Database = new (require('./database/mysql'))()
const Requester = new (require('./requester'))()
const Parser = new (require('./parser'))()

moment.locale('ko')
TelegramAPI.sendStartMessage()

let run = async () => {
  try {
    let html: string = await Requester.load()
    let timestamp: number = Parser.getUpdateDate(html).getTime()
    let recentLog = await Database.getRecentLog()
    let recentTimestamp: number = new Date(recentLog.date).getTime()

    // 업데이트날짜가 최신임
    if (timestamp === recentTimestamp) return

    let currentDate: any = moment(timestamp)
    let messages: string[] = []
    let status: object[] | null = Parser.getStatus(html)

    messages.push(currentDate.format('YYYY년 MM월 DD일 A hh시'))

    if (status === null) throw '확진자 파싱 실패'

    status.forEach((item: any) => {
      let increment: number = item.data.value - recentLog[item.key]

      messages.push(
        `${item.data.title} ${item.data.displayValue}명` +
          (increment > 0 ? `(+${increment})` : '')
      )
    })

    let infectedItem: any = _.find(status, { key: 'infected' })
    let testedItem: any = _.find(status, { key: 'tested' })
    let recoveredItem: any = _.find(status, { key: 'recovered' })
    let deathsItem: any = _.find(status, { key: 'deaths' })

    Database.addLog(
      currentDate.format('YYYY-MM-DD HH:mm:ss'),
      infectedItem.data.value,
      recoveredItem.data.value,
      deathsItem.data.value,
      testedItem.data.value
    )

    console.log(messages.join('\n'))
    TelegramAPI.sendMessage(messages.join('\n'))
  } catch (error) {
    console.error(error)
    TelegramAPI.sendMessageAdmin('ERROR: ' + error)
  } finally {
    Database.end()
  }
}

run()
