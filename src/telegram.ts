import moment from 'moment'
import TelegramBot from 'node-telegram-bot-api'
import * as config from './config.json'

export default new (class TelegramAPI {
  private token: string = config.telegram_token
  private channelId: string = config.channel_id
  private adminId: number = config.admin_id
  private bot: TelegramBot = new TelegramBot(this.token)

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
})()
