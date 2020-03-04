import _ from 'lodash'
import moment from 'moment'
import TelegramAPI from './telegram'
import Database, { Log, RegionLog } from './database/mysql'
import Requester, { ApiRegion, ApiRegionObject } from './requester'
import Parser, { Status } from './parser'

moment.locale('ko')
TelegramAPI.sendStartMessage()

let asyncForEach = async (array: Array<any>, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

let runStatus = async () => {
  let html: string = await Requester.load()
  let updateDate: Date = Parser.getUpdateDate(html)
  let statusList: Status[] = Parser.getStatus(html)
  let statusInfected: Status | undefined = _.find(statusList, { key: 'infected' })
  let statusTested: Status | undefined = _.find(statusList, { key: 'tested' })
  let statusRecovered: Status | undefined = _.find(statusList, { key: 'recovered' })
  let statusDeaths: Status | undefined = _.find(statusList, { key: 'deaths' })

  if ([statusInfected, statusTested, statusRecovered, statusDeaths].some(element => element === undefined))
    throw '확진자 파싱 실패'

  let newLog: Log = {
    date: updateDate,
    infected: statusInfected!.value,
    recovered: statusRecovered!.value,
    deaths: statusDeaths!.value,
    tested: statusTested!.value,
    infectedIncrement: statusInfected!.increment,
    recoveredIncrement: statusRecovered!.increment,
    deathsIncrement: statusDeaths!.increment,
    testedIncrement: statusTested!.increment
  }

  // 업데이트 데이터가 최신
  if ((await Database.getLog(newLog)) !== undefined) return

  let messages: string[] = []
  let alreadyExistLog = await Database.getLogByDate(updateDate)
  if (alreadyExistLog) {
    // 데이터가 변경되어 재알림
    messages.push('[데이터가 새로 업데이트 되었습니다]')
    Database.updateLogByDate(newLog)
  } else {
    Database.addLog(newLog)
  }

  messages.push(moment(newLog.date).format('YYYY년 MM월 DD일 A hh시'))
  statusList.forEach((item: Status) => {
    messages.push(`${item.title} ${item.displayValue}명` + (item.increment > 0 ? `(+${item.increment})` : ''))
  })

  console.log(messages.join('\n'))
  TelegramAPI.sendMessage(messages.join('\n'))
}

let runRegion = () => {
  return new Promise(async (resolve: any, reject: any) => {
    let apiRegionData: ApiRegionObject = await Requester.loadRegion()
    let apiUpdateDate: Date = Parser.replaceUpdateDateTextToDateObject(apiRegionData.result.updateTime)

    if (Object.keys(apiRegionData.result).length === 0 || Object.keys(apiRegionData.result.regions).length === 0)
      throw '지역별 확진자 파싱 실패'
    if (apiRegionData.result.updateTime.length === 0) throw '지역별 확진자 업데이트 날짜 파싱 실패'

    let prevUpdateDate: Date | undefined = await Database.getPreviousDateFromRegionLog(apiUpdateDate)
    let newRegionDataFlag = false

    let messages: string[] = []
    messages.push('[지역별 확진환자 현황]')
    messages.push(moment(apiUpdateDate).format('YYYY년 MM월 DD일 A hh시'))

    await asyncForEach(apiRegionData.result.regions, async (region: ApiRegion) => {
      let newRegionLog: RegionLog = {
        date: apiUpdateDate,
        name: region.title,
        infected: Number(region.count.replace(',', '')),
        ratio: Number(region.rate.replace('%', ''))
      }

      let regionLog: RegionLog | undefined = await Database.getRegionLogByDateAndName(newRegionLog.date, newRegionLog.name)
      if (regionLog === undefined) {
        newRegionDataFlag = true
        await Database.addRegionLog(newRegionLog)

        if (prevUpdateDate === undefined) return

        let previousRegionLog: RegionLog | undefined = await Database.getRegionLogByDateAndName(prevUpdateDate, newRegionLog.name)
        let incrementMessage: string | null = null
        if (previousRegionLog) {
          let increment: number = newRegionLog.infected - previousRegionLog.infected

          if (increment > 0) {
            incrementMessage = `(+${increment})`
          }
        }

        messages.push(`${newRegionLog.name} ${region.count}명` + (incrementMessage ? incrementMessage : ''))
      }
    })

    if (newRegionDataFlag) {
      TelegramAPI.sendMessage(messages.join('\n'))
      console.log(messages.join('\n'))
    }

    resolve()
  })
}

let run = async () => {
  try {
    await runStatus()
    await runRegion()
  } catch (error) {
    console.error(error)
    TelegramAPI.sendMessageAdmin('ERROR: ' + error)
  } finally {
    Database.end()
  }
}

run()
