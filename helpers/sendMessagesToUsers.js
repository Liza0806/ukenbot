const sendMessagesToUsers = async (ctx, users, messageText) => {
  if (!messageText) {
    await ctx.reply("Пожалуйста, укажите текст сообщения.");
    return;
  }

  try {
    // Создаем массив промисов для отправки сообщений
    const sendMessages = users.map(async (user) => {
      try {
        await ctx.api.sendMessage(user.telegramId, messageText); // Отправляем сообщение
      } catch (err) {
        console.error(
          `Не удалось отправить сообщение пользователю ${user.telegramId}`,
          err
        );
      }
    });

    // Ожидаем завершения всех отправок
    await Promise.all(sendMessages);

    // Сообщаем об успешной отправке
  } catch (err) {
    console.error("Ошибка при отправке сообщений пользователям:", err);
    await ctx.reply("Произошла ошибка при отправке сообщений.");
  }
};

module.exports = sendMessagesToUsers;
