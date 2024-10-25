  const { Event } = require("../models/eventModel");

const getTodaySchedule = async (ctx) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // начало дня
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // конец дня

  const events = await Event.find({ date: { $gte: startOfDay, $lt: endOfDay } });
  
  if (events.length === 0) {
    await ctx.reply("Костя сегодня свободен!");
    return;
  }

  let scheduleMessage = "Вот тренировки на сегодня:\n";
  events.forEach(event => {
    scheduleMessage += `- ${event.date}: ${event.groupTitle}\n`; 
  });
  
  await ctx.reply(scheduleMessage);
};

module.exports = { getTodaySchedule };
