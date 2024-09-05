const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");
const { User } = require("../models/userModel");
const { Event } = require("../models/eventModel");
const {
  deleteMessageAfterDelay,
} = require("../helpers/deleteMessageAfterDelay");

async function noHandler(ctx) {
  let replyMessageIds = [];

  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ telegramId: userId }).exec();
    if (!user) {
      const reply = await ctx.reply("Пользователь не найден 😕");
      replyMessageIds.push(reply.message_id);
      return;
    }
    const group = await Group.findById(ctx.session.selectedGroup).exec();
    if (!group) {
      const reply = await ctx.reply("Группа не найдена 😕");
      replyMessageIds.push(reply.message_id);
      return;
    }

    const event = await Event.findById(ctx.session.nextEvent);
    if (!event) {
      const reply = await ctx.reply("Событие не найдено 😕");
      replyMessageIds.push(reply.message_id);
      return;
    }

    // Удаление пользователя из участников события
    event.participants = event.participants.filter((p) => p.id !== userId);
    await event.save();

    // Удаление посещений пользователя
    user.visits = user.visits.filter((v) => v.eventId !== event._id);
    await user.save();

    // Клавиатура для возможности отменить отмену тренировки
    const cancelTrainingKeyboard = new InlineKeyboard().text(
      "Все-таки пойду 💪",
      "accept_training"
    );

    // Отправляем сообщение с клавиатурой
    const reply = await ctx.reply(
      `Даже у самых сильных иногда бывают минуты слабости! 😔 Ты не идешь на тренировку ${ctx.session.nextEventDate} в ${ctx.session.nextEventTime} вместе с группой ${ctx.session.groupTitle}.`,
      {
        reply_markup: cancelTrainingKeyboard,
      }
    );
    replyMessageIds.push(reply.message_id);
  } catch (error) {
    const errorMessage = await ctx.reply(
      "Извините, произошла ошибка при удалении вас из события ⚠️"
    );
    replyMessageIds.push(errorMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  }
}

module.exports = { noHandler };
