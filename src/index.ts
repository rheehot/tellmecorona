import _ from 'lodash'
import moment from 'moment'
import TelegramAPI from './telegram'
import Database from './database/mysql'
import Requester from './requester'
import Parser, { Status } from './parser'

moment.locale('ko')
TelegramAPI.sendStartMessage()

let run = async () => {
  try {
    let html: string = await Requester.load()
    let timestamp: number = Parser.getUpdateDate(html).getTime()
    let recentLog: any = await Database.getRecentLog()
    let recentTimestamp: number = new Date(recentLog.date).getTime()

    // 업데이트날짜가 최신임
    if (timestamp === recentTimestamp) return

    let currentDate: moment.Moment = moment(timestamp)
    let messages: string[] = []
    let statusList: Status[] = Parser.getStatus(html)

    messages.push(currentDate.format('YYYY년 MM월 DD일 A hh시'))

    statusList.forEach((item: Status) => {
      let increment: number = item.data.value - recentLog[item.key]

      messages.push(`${item.data.title} ${item.data.displayValue}명` + (increment > 0 ? `(+${increment})` : ''))
    })

    let infectedItem: Status | undefined = _.find(statusList, { key: 'infected' })
    let testedItem: Status | undefined = _.find(statusList, { key: 'tested' })
    let recoveredItem: Status | undefined = _.find(statusList, { key: 'recovered' })
    let deathsItem: Status | undefined = _.find(statusList, { key: 'deaths' })

    if (infectedItem === undefined || testedItem === undefined || recoveredItem === undefined || deathsItem === undefined) throw '확진자 파싱 실패'

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
