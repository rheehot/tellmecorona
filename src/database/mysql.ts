import mysql from 'mysql'
import * as config from './config.json'

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

  public addLog(
    date: string,
    infected: number,
    recovered: number,
    deaths: number,
    tested: number
  ): void {
    this.connection.query(
      'INSERT INTO `log` (`date`, `infected`, `recovered`, `deaths`, `tested`) VALUES (?, ?, ?, ?, ?)',
      [date, infected, recovered, deaths, tested],
      (error: any, result: any, fields: any) => {
        if (error) throw error
      }
    )
  }

  public getRecentLog(): Promise<object> {
    return new Promise((resolve, reject) => {
      this.connection.query(
        'SELECT * FROM `log` ORDER BY `date` DESC LIMIT 1',
        (error: any, result: any, fields: any) => {
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
