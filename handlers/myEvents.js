const { InlineKeyboard } = require("grammy");
const { Event } = require("../models/eventModel");
const {
  deleteMessageAfterDelay,
} = require("../helpers/deleteMessageAfterDelay");

async function myEvents(ctx) {
  const userId = ctx.from.id.toString();

  let replyMessageIds = [];

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1 число текущего месяца
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Последний день текущего месяца

    const events = await Event.find({
      "participants.id": userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }, // Фильтрация по дате
    });

    if (events.length === 0) {
      const reply = await ctx.reply("🤔 Не найдено тренировок.");
      replyMessageIds.push(reply.message_id);
      deleteMessageAfterDelay(ctx, replyMessageIds, 500);
      return;
    }

    // Создаем кнопки для клавиатуры
    const rows = events.map((event) => [
      {
        text: `${event.date.toDateString()} - ${event.groupTitle}`,
        callback_data: `event_${event._id}`,
      },
    ]);
    const groupKeyboard = new InlineKeyboard(rows);

    const reply = await ctx.reply("Вот твои тренировки:", {
      reply_markup: groupKeyboard,
    });
    replyMessageIds.push(reply.message_id);
  } catch (error) {
    console.error("Ошибка при загрузке тренировок:", error);
    const errorMessage = await ctx.reply(
      "🚨 Извините, произошла ошибка при загрузке тренировок."
    );
    replyMessageIds.push(ctx.message.message_id);
    replyMessageIds.push(errorMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  }
}

module.exports = { myEvents };
