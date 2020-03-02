import mysql from 'mysql'
import * as config from './config.json'

export interface Log {
  [key: string]: Date | number
  date: Date
  infected: number
  recovered: number
  deaths: number
  tested: number
  infectedIncrement: number
  recoveredIncrement: number
  deathsIncrement: number
  testedIncrement: number
}

export interface RegionLog {
  date: Date
  name: string
  infected: number
  ratio: number
}

export default new (class database {
  private connection: mysql.Connection

  constructor() {
    this.connection = mysql.createConnection({
      host: config.host,
      user: config.user,
      database: config.database,
      password: config.password
    })
  }

  public addLog(log: Log): void {
    this.connection.query(
      'INSERT INTO `log` (`date`, `infected`, `recovered`, `deaths`, `tested`, `infected_increment`, `recovered_increment`, `deaths_increment`, `tested_increment`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        log.date,
        log.infected,
        log.recovered,
        log.deaths,
        log.tested,
        log.infectedIncrement,
        log.recoveredIncrement,
        log.deathsIncrement,
        log.testedIncrement
      ],
      (error: mysql.MysqlError | null, result: any) => {
        if (error) throw error
      }
    )
  }

  public addRegionLog(regionLog: RegionLog): void {
    this.connection.query(
      'INSERT INTO `region_log` (`date`, `name`, `infected`, `ratio`) VALUES (?, ?, ?, ?)',
      [regionLog.date, regionLog.name, regionLog.infected, regionLog.ratio],
      (error: mysql.MysqlError | null, result: any) => {
        if (error) throw error
      }
    )
  }

  public updateLogByDate(log: Log): void {
    this.connection.query(
      'UPDATE `log` SET `infected`=?, `recovered`=?, `deaths`=?, `tested`=?, `infected_increment`=?, `recovered_increment`=?, `deaths_increment`=?, `tested_increment`=? WHERE `date`=?',
      [
        log.infected,
        log.recovered,
        log.deaths,
        log.tested,
        log.infectedIncrement,
        log.recoveredIncrement,
        log.deathsIncrement,
        log.testedIncrement,
        log.date
      ],
      (error: mysql.MysqlError | null, result: any) => {
        if (error) throw error
      }
    )
  }

  public getLastLogByDateLessThan(date: Date): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `log` where `date`<? ORDER BY `date` DESC LIMIT 1',
        [date],
        (error: mysql.MysqlError | null, result: any) => {
          if (error) reject(error)

          resolve(result[0])
        }
      )
    })
  }

  public getLastDateFromRegionLog(): Promise<Date> | undefined {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT `date` FROM `region_log` ORDER BY `date` DESC LIMIT 1',
        (error: mysql.MysqlError | null, result: any) => {
          if (error) reject(error)

          if (result === undefined) {
            resolve(result)
          } else {
            resolve(result[0].date)
          }
        }
      )
    })
  }

  public getLog(log: Log): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `log` WHERE `date`=? and `infected`=? and `recovered`=? and `deaths`=? and `tested`=? and `infected_increment`=? and `recovered_increment`=? and `deaths_increment`=? and `tested_increment`=? LIMIT 1',
        [
          log.date,
          log.infected,
          log.recovered,
          log.deaths,
          log.tested,
          log.infectedIncrement,
          log.recoveredIncrement,
          log.deathsIncrement,
          log.testedIncrement
        ],
        (error: mysql.MysqlError | null, result: any) => {
          if (error) reject(error)

          resolve(result[0])
        }
      )
    })
  }

  public getRegionLogByDateAndName(date: Date, name: string): Promise<RegionLog> | undefined {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `region_log` WHERE `date`=? and `name`=? LIMIT 1',
        [date, name],
        (error: mysql.MysqlError | null, result: any) => {
          if (error) reject(error)

          if (result === undefined) {
            resolve(result)
          } else {
            resolve(result[0])
          }
        }
      )
    })
  }

  public getLogByDate(date: Date): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `log` WHERE `date`=? LIMIT 1',
        [date],
        (error: mysql.MysqlError | null, result: any) => {
          if (error) reject(error)

          resolve(result[0])
        }
      )
    })
  }

  public end(): void {
    this.connection.end()
  }
})()
