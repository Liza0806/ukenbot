const { User } = require("../models/userModel");

const sendBroadcastMessage = async (ctx) => {
  // Получаем текст сообщения, которое нужно отправить
  const messageText = ctx.message.text.split(" ").slice(1).join(" ");

  if (!messageText) {
    return ctx.reply("Пожалуйста, укажите текст для рассылки.");
  }

  try {
    const users = await User.find({ telegramId: { $exists: true } });

    // Проходим по каждому пользователю и отправляем сообщение
    for (let user of users) {
      try {
        await ctx.api.sendMessage(user.telegramId, messageText); // Здесь используем `ctx.api.sendMessage`
      } catch (err) {
        console.error(
          `Не удалось отправить сообщение пользователю с ID ${user.telegramId}:`,
          err
        );
      }
    }
  } catch (err) {
    console.error("Ошибка при рассылке сообщений:", err);
  }
};

module.exports = { sendBroadcastMessage };
