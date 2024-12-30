const { User } = require("../models/userModel");
const sendMessagesToUsers = require("../helpers/sendMessagesToUsers");

const sendMessageToAllUsers = async (ctx) => {
  const messageText = ctx.message?.text;

  if (!messageText) {
    return ctx.reply("Пожалуйста, введите текст для рассылки всем.");
  }

  try {
    const users = await User.find({ telegramId: { $exists: true } });

    if (users.length === 0) {
      return ctx.reply("Нет пользователей для рассылки.");
    }

    // Параллельная отправка сообщений с обработкой ошибок для каждого пользователя
    await sendMessagesToUsers(ctx, users, messageText);
    await ctx.reply("Сообщение успешно отправлено всем пользователям.")
  } catch (err) {
    console.error("Ошибка при рассылке сообщений:", err);
    await ctx.reply("Произошла ошибка при рассылке сообщений.");
  }
};

module.exports = sendMessageToAllUsers;
