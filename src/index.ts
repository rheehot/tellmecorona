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
      tested: newStatusTested!.value,
      infectedIncrement: newStatusInfected!.increment,
      recoveredIncrement: newStatusRecovered!.increment,
      deathsIncrement: newStatusDeaths!.increment,
      testedIncrement: newStatusTested!.increment
    }

    // 업데이트 데이터가 최신
    if ((await Database.getLog(newLog)) !== undefined) return

    let messages: string[] = []
    let alreadyExistLog = await Database.getLogByDate(newUpdateDate)
    if (alreadyExistLog) {
      // 데이터가 변경되어 재알림
      messages.push('[데이터가 새로 업데이트 되었습니다]')
      Database.updateLogByDate(newLog)
    } else {
      Database.addLog(newLog)
    }

    messages.push(moment(newLog.date).format('YYYY년 MM월 DD일 A hh시'))
    newStatusList.forEach((item: Status) => {
      messages.push(`${item.title} ${item.displayValue}명` + (item.increment > 0 ? `(+${item.increment})` : ''))
    })

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
