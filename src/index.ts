import _ from 'lodash'
import moment from 'moment'
import TelegramAPI from './telegram'
import Database, { Log } from './database/mysql'
import Requester from './requester'
import Parser, { Status } from './parser'

moment.locale('ko')
TelegramAPI.sendStartMessage()

let run = async () => {
  try {
    let html: string = await Requester.load()
    let newUpdateDate: Date = Parser.getUpdateDate(html)
    let newStatusList: Status[] = Parser.getStatus(html)
    let newStatusInfected: Status | undefined = _.find(newStatusList, { key: 'infected' })
    let newStatusTested: Status | undefined = _.find(newStatusList, { key: 'tested' })
    let newStatusRecovered: Status | undefined = _.find(newStatusList, { key: 'recovered' })
    let newStatusDeaths: Status | undefined = _.find(newStatusList, { key: 'deaths' })

    if ([newStatusInfected, newStatusTested, newStatusRecovered, newStatusDeaths].some(element => element === undefined))
      throw '확진자 파싱 실패'

    let newLog: Log = {
      date: newUpdateDate,
      infected: newStatusInfected!.value,
      recovered: newStatusRecovered!.value,
      deaths: newStatusDeaths!.value,
      tested: newStatusTested!.value
    }

    // 업데이트 데이터가 최신
    if ((await Database.getLog(newLog)) !== undefined) return

    let messages: string[] = []

    messages.push(moment(newLog.date).format('YYYY년 MM월 DD일 A hh시'))

    let alreadyExistLog = await Database.getLogByDate(newUpdateDate)
    if (alreadyExistLog) {
      Database.updateLogByDate(newLog)
    } else {
      Database.addLog(newLog)
    }

    let lastLog: Log = await Database.getLastLogByDateLessThan(newLog.date)
    newStatusList.forEach((item: Status) => {
      let increment: number = item.value - Number(lastLog[item.key])
      messages.push(`${item.title} ${item.displayValue}명` + (increment > 0 ? `(+${increment})` : ''))
    })

    // 데이터가 변경되어 재알림
    if (alreadyExistLog) {
      let newMessages = messages.slice()
      newMessages.unshift('[데이터가 새로 업데이트 되었습니다]')
      TelegramAPI.sendMessage(newMessages.join('\n'))
    }

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
