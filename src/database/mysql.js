const mysql = require('mysql')
const config = require('./config.json')

class db {
  constructor() {
    this.connection = mysql.createConnection({
      host: config.host,
      user: config.user,
      database: config.database,
      password: config.password
    })
  }

  addLog(date, infected, recovered, deaths, tested) {
    this.connection.query(
      'INSERT INTO `log` (`date`, `infected`, `recovered`, `deaths`, `tested`) VALUES (?, ?, ?, ?, ?)',
      [date, infected, recovered, deaths, tested],
      (error, result, fields) => {
        if (error) {
          console.log('DB ERROR: ' + error)
        }
      }
    )
  }

  getRecentLog(callback) {
    return this.connection.query(
      'SELECT * FROM `log` ORDER BY `date` DESC LIMIT 1',
      (error, result, fields) => {
        if (error) {
          console.log('DB ERROR: ' + error)
        }
        callback(result[0])
      }
    )
  }

  end() {
    this.connection.end()
  }
}

module.exports = db
