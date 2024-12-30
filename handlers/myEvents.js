const { Event } = require("../models/eventModel");

async function myEvents(ctx) {
  const userId = ctx.from.id.toString();

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const events = await Event.find({
      "participants.id": userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (events.length === 0) {
      await ctx.reply("🤔 Не найдено тренировок.");
      return;
    }

    // Генерация списка тренировок
    const eventList = events
      .map((event, index) => {
        // Преобразуем дату из строки в объект Date
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
        const dayOfWeek = eventDate.toLocaleDateString("ru-RU", { weekday: "long" });

        return `${index + 1}. ${formattedDate}, ${dayOfWeek} (${event.groupTitle})`;
      })
      .join("\n");


    // Отправляем сообщение пользователю
    await ctx.reply(
      `Вот твои тренировки:\n\n${eventList}\n\nВсего в этом месяце ты был на тренировках ${events.length} раз.`
    );
  } catch (error) {
    console.error("Ошибка при загрузке тренировок:", error);
    await ctx.reply("🚨 Извините, произошла ошибка при загрузке тренировок.");
  }
}

module.exports = { myEvents };
