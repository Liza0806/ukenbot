const { Event } = require("../models/eventModel");
const moment = require("moment");
const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");

async function groupsCommand(ctx, groupId) {
  try {
    const now = moment().toISOString(); // .toISOString() !!!!

    // Запрос в MongoDB для поиска ближайшего будущего события по groupId
    const upcomingEvent = await Event.find({
      groupId: groupId, 
      isCancelled: false, 
      date: { $gt: now }, // Дата позже текущей
    })
      .sort({ date: 1 })
      .limit(1)
      .exec(); // Сортируем по дате (по возрастанию) и берем первое

    if (upcomingEvent.length === 0) {
      ctx.reply("Нет будущих событий для этой группы");
      return;
    }

    ctx.session.selectedGroupId = upcomingEvent[0].groupId; // это для yesHandler, не удаляй
    ctx.session.nextEventId = upcomingEvent[0]._id; // это для yesHandler, не удаляй

    const inlineKeyboard = new InlineKeyboard()
      .text("✅ Пойду", "accept_training")
      .text("🚫 Не пойду", "cancel_training");

    await ctx.reply(
      `📅 Следующая тренировка будет ${upcomingEvent[0]?.date}. Пойдешь?`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } catch (error) {
    console.error("Ошибка при получении событий:", error);
    await ctx.reply("Произошла ошибка при получении событий.");
  }
}

module.exports = { groupsCommand };
