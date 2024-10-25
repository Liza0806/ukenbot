const { Event } = require("../models/eventModel");

const getTodaySchedule = async (ctx) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const events = await Event.find({ date: { $gte: startOfDay, $lt: endOfDay } });

  if (events.length === 0) {
    await ctx.reply("Костя сегодня свободен!");
    return;
  }

  let scheduleMessage = "Вот тренировки на сегодня:\n";
  events.forEach((event, index) => {
    const time = event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // формат времени
    const emojiIndex = index + 1;
    const emoji = emojiIndex === 1 ? '1️⃣' :
                  emojiIndex === 2 ? '2️⃣' :
                  emojiIndex === 3 ? '3️⃣' :
                  emojiIndex === 4 ? '4️⃣' :
                  emojiIndex === 5 ? '5️⃣' : 
                  emojiIndex === 6 ? '6️⃣' : 
                  emojiIndex === 7 ? '7️⃣' : 
                  emojiIndex === 8 ? '8️⃣' : 
                  emojiIndex === 9 ? '9️⃣' : 
                  emojiIndex === 10 ? '🔟' : 
                  emojiIndex === 11 ? '1️⃣1️⃣' : '1️⃣2️⃣';
    scheduleMessage += `${emoji} ${time} - ${event.groupTitle}\n`;
  });
  
  await ctx.reply(scheduleMessage);
};

module.exports = { getTodaySchedule };
