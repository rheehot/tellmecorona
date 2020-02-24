const config = require("./config.json");
const TelegramBotAPI = require("node-telegram-bot-api");
const token = config.telegram_token;

class TelegramBot {
  constructor() {
    this.bot = new TelegramBotAPI(token);
    this.channelId = config.channel_id;
    this.adminId = config.admin_id;
  }

  sendMessage(message) {
    if (process.env.NODE_ENV === "production") {
      this.bot.sendMessage(this.channelId, message);
    }
  }

  sendMessageAdmin(message) {
    if (process.env.NODE_ENV === "production") {
      this.bot.sendMessage(this.adminId, message);
    }
  }
}

module.exports = TelegramBot;
