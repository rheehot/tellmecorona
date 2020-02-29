import mysql from 'mysql'
import * as config from './config.json'

export interface Log {
  [key: string]: any
  date: Date
  infected: number
  recovered: number
  deaths: number
  tested: number
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
      'INSERT INTO `log` (`date`, `infected`, `recovered`, `deaths`, `tested`) VALUES (?, ?, ?, ?, ?)',
      [log.date, log.infected, log.recovered, log.deaths, log.tested],
      (error: any, result: any, fields: any) => {
        if (error) throw error
      }
    )
  }

  public updateLogByDate(log: Log): void {
    this.connection.query(
      'UPDATE `log` SET `infected`=?, `recovered`=?, `deaths`=?, `tested`=? WHERE `date`=?',
      [log.infected, log.recovered, log.deaths, log.tested, log.date],
      (error: any, result: any, fields: any) => {
        if (error) throw error
      }
    )
  }

  public getLastLogByDateLess(date: Date): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM `log` where `date`<? ORDER BY `date` DESC LIMIT 1', [date], (error: any, result: any, fields: any) => {
        if (error) reject(error)

        resolve(result[0])
      })
    })
  }

  public getLog(log: Log): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `log` WHERE `date`=? and `infected`=? and `recovered`=? and `deaths`=? and `tested`=? LIMIT 1',
        [log.date, log.infected, log.recovered, log.deaths, log.tested],
        (error: any, result: any, fields: any) => {
          if (error) reject(error)

          resolve(result[0])
        }
      )
    })
  }

  public getLogByDate(date: Date): Promise<Log> {
    return new Promise((resolve, reject) => {
      this.connection.query('SELECT * FROM `log` WHERE `date`=? LIMIT 1', [date], (error: any, result: any, fields: any) => {
        if (error) reject(error)

        resolve(result[0])
      })
    })
  }

  public end(): void {
    this.connection.end()
  }
})()
