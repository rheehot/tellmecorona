;(function() {
  const mysql = require('mysql')
  const config: any = require('./config.json')

  class db {
    private connection: any

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
          if (error) {
            console.log('DB ERROR: ' + error)
          }
        }
      )
    }

    public getRecentLog(callback: any) {
      return this.connection.query(
        'SELECT * FROM `log` ORDER BY `date` DESC LIMIT 1',
        (error: any, result: any, fields: any) => {
          if (error) {
            console.log('DB ERROR: ' + error)
          }
          callback(result[0])
        }
      )
    }

    public end(): void {
      this.connection.end()
    }
  }

  module.exports = db
})()
