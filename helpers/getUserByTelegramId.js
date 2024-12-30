// Функция для получения пользователя по telegramId
const { User } = require("../models/userModel");

async function getUserByTelegramId(telegramId) {
    return User.findOne({ telegramId }).exec();
  }

  module.exports = getUserByTelegramId;