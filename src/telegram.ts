import moment from 'moment'
import TelegramBot from 'node-telegram-bot-api'
import * as config from './config.json'
;(() => {
  const token = config.telegram_token

  class TelegramAPI {
    private bot: TelegramBot = new TelegramBot(token)
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

  module.exports = TelegramAPI
})()
