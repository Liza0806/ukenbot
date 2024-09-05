const { Group } = require("../models/groupModel");
const { User } = require("../models/userModel");
const { Event } = require("../models/eventModel");
const { InlineKeyboard } = require("grammy");
const {
  deleteMessageAfterDelay,
} = require("../helpers/deleteMessageAfterDelay");

async function yesHandler(ctx) {
  let replyMessageIds = [];

  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ telegramId: userId }).exec();
    if (!user) {
      const reply = await ctx.reply("Пользователь не найден 😕");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 500);
    }
    if (!user.groups.includes(ctx.session.selectedGroup)) {
      user.groups.push(ctx.session.selectedGroup);
    }
    const group = await Group.findById(ctx.session.selectedGroup).exec();
    if (!group) {
      const reply = await ctx.reply("Группа не найдена 😕");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 500);
    }
    const event = await Event.findById(ctx.session.nextEvent);
    if (!event) {
      const reply = await ctx.reply("Событие не найдено 😕");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 500);
    }
    const isAlreadyParticipant = event.participants.some(
      (p) => p.id === userId
    );
    if (isAlreadyParticipant) {
      const reply = await ctx.reply("Боец, ты уже записался на тренировку 💪");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
    }

    event.participants.push({ id: userId, name: user.name });
    await event.save();

    user.visits.push({
      date: event.date,
      groupId: ctx.session.selectedGroup,
      eventId: ctx.session.nextEvent,
    });
    await user.save();

    const cancelTrainingKeyboard = new InlineKeyboard().text(
      "Отменить тренировку 🛑",
      "cancel_training"
    );

    await ctx.reply(
      `Поздравляю! Ты идешь на тренировку ${ctx.session.nextEventDate} в ${ctx.session.nextEventTime} вместе с группой ${ctx.session.groupTitle} 🎉`,
      {
        reply_markup: cancelTrainingKeyboard,
      }
    );

    deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  } catch (error) {
    const reply = await ctx.reply(
      "Извините, произошла ошибка при добавлении вас на событие ⚠️"
    );
    replyMessageIds.push(reply.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  }
}

module.exports = { yesHandler };
