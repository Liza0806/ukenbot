// Функция для отправки сообщения об ошибке

async function replyWithError(ctx, message) {
    await ctx.reply(message);
  }

  module.exports = replyWithError;