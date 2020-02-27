const moment = require('moment')
const TelegramBotAPI = require('node-telegram-bot-api')
const config = require('./config.json')
const token = config.telegram_token

class TelegramBot {
  constructor() {
    this.bot = new TelegramBotAPI(token)
    this.channelId = config.channel_id
    this.adminId = config.admin_id
  }

  sendMessage(message) {
    if (process.env.NODE_ENV === 'production') {
      this.bot.sendMessage(this.channelId, message)
    }
  }

  sendMessageAdmin(message) {
    if (process.env.NODE_ENV === 'production') {
      this.bot.sendMessage(this.adminId, message)
    }
  }

  sendStartMessage() {
    this.sendMessageAdmin(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start.')
  }
}

module.exports = TelegramBot
