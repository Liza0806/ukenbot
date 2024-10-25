const { Event } = require("../models/eventModel");
const { deleteMessageAfterDelay } = require("../helpers/deleteMessageAfterDelay");

async function myEvents(ctx) {
  const userId = ctx.from.id.toString();
  let replyMessageIds = [];

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const events = await Event.find({
      "participants.id": userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (events.length === 0) {
      const reply = await ctx.reply("🤔 Не найдено тренировок.");
      replyMessageIds.push(reply.message_id);
      deleteMessageAfterDelay(ctx, replyMessageIds, 500);
      return;
    }

    // список тренировок 
    const eventList = events
      .map((event, index) => {
        const eventDate = event.date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
        const dayOfWeek = event.date.toLocaleDateString("ru-RU", { weekday: "long" });
        return `${index + 1}. ${eventDate}, ${dayOfWeek} (${event.groupTitle})`;
      })
      .join("\n");

 
    const reply = await ctx.reply(
      `Вот твои тренировки:\n\n${eventList}\n\nВсего в этом месяце ты был на тренировках ${events.length} раз.`
    );
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
