const { InlineKeyboard } = require("grammy");
const replyWithError = require("../helpers/replyWithError");
const getEventById = require("../helpers/getEventById");
const getUserByTelegramId = require("../helpers/getUserByTelegramId");
const addUserToEvent = require("../helpers/addUserToEvent");

async function yesHandler(ctx) {
  // Клавиатура для возможности отменить тренировку
  const cancelTrainingKeyboard = new InlineKeyboard().text(
    "Отменить тренировку 🛑",
    "cancel_training"
  );

  try {
    await ctx.answerCallbackQuery();

    const event = await getEventById(ctx.session.nextEventId);
    if (!event) return replyWithError(ctx, "Событие не найдено 😕");

    const userId = ctx.from.id.toString();
    const user = await getUserByTelegramId(userId);
    if (!user) return replyWithError(ctx, "Пользователь не найден 😕");

    // Добавляем группу, если её нет в списке
    if (!user.groups.includes(ctx.session.selectedGroupId)) {
      user.groups.push(ctx.session.selectedGroupId);
    }

    // Добавляем пользователя в событие
    const isUserAdded = await addUserToEvent(
      user,
      event,
      ctx.session.selectedGroupId
    );
    if (!isUserAdded) {
      return await ctx.reply("Боец, ты уже записался на тренировку 💪", {
        reply_markup: cancelTrainingKeyboard,
      });
    }
    await ctx.reply(`Поздравляю! Ты идешь на тренировку 🎉`, {
      reply_markup: cancelTrainingKeyboard,
    });
  } catch (error) {
    console.error("Ошибка при обработке команды:", error);
    await replyWithError(
      ctx,
      "Извините, произошла ошибка при добавлении вас на событие ⚠️"
    );
  }
}

module.exports = { yesHandler };
