;(function() {
  const moment = require('moment')
  const TelegramBotAPI = require('node-telegram-bot-api')
  const config = require('./config.json')
  const token = config.telegram_token

  class TelegramBot {
    private bot: any = new TelegramBotAPI(token)
    private channelId: string
    private adminId: number

    constructor() {
      this.channelId = config.channel_id
      this.adminId = config.admin_id
    }

    public sendMessage(message: string): void {
      if (process.env.NODE_ENV === 'production') {
        this.bot.sendMessage(this.channelId, message)
      }
    }

    public sendMessageAdmin(message: string): void {
      if (process.env.NODE_ENV === 'production') {
        this.bot.sendMessage(this.adminId, message)
      }
    }

    public sendStartMessage(): void {
      this.sendMessageAdmin(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start.')
    }
  }

  module.exports = TelegramBot
})()
