const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");
const { User } = require("../models/userModel");
const { Event } = require("../models/eventModel");
const replyWithError = require("../helpers/replyWithError");
const getEventById = require("../helpers/getEventById");
const getGroupById = require("../helpers/getGroupById");
const getUserByTelegramId = require("../helpers/getUserByTelegramId");
const removeUserFromEvent = require("../helpers/removeUserFromEvent");

async function noHandler(ctx) {
  // Клавиатура для возможности отменить отмену тренировки
  const cancelTrainingKeyboard = new InlineKeyboard().text(
    "Все-таки пойду 💪",
    "accept_training"
  );
  try {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id.toString();
    const user = await getUserByTelegramId(userId);
    if (!user) return replyWithError(ctx, "Пользователь не найден 😕");

    const group = await getGroupById(ctx.session.selectedGroupId);
    if (!group) return replyWithError(ctx, "Группа не найдена 😕");

    const event = await getEventById(ctx.session.nextEventId);
    if (!event) return replyWithError(ctx, "Событие не найдено 😕");

  

    // Удаление пользователя из участников события
     // Добавляем пользователя в событие
     const isUserRemoved = await removeUserFromEvent(
      user,
      event,
      ctx.session.selectedGroupId
    );
   
  

    // Отправляем сообщение с клавиатурой
   await ctx.reply(
      `Даже у самых сильных иногда бывают минуты слабости! 😔 Ты не идешь на тренировку`,
      {
        reply_markup: cancelTrainingKeyboard,
      }
    );

  } catch (error) {
    console.error("Ошибка при обработке команды:", error);
    await replyWithError(
      ctx,
      "Извините, произошла ошибка при удалении вас из события ⚠️"
    );
  }
}

module.exports = { noHandler };
