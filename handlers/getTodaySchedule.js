const { Event } = require("../models/eventModel");

const getTodaySchedule = async (ctx) => {
    const userId = ctx.from.id.toString();
    const now = new Date();
    const startOfDay = new Date(now.getDay(), now.getDay(), 1); //начало дня 
    const endOfDay = new Date(now.getDay(), now.getDay() + 1, 0); // конец дня
    const events = await Event.find({ date: { $gte: startOfDay, $lte: endOfDay }})
    if (events.length === 0) {
      const reply = await ctx.reply("Костя сегодня свободен!");
      return;
    }
    let scheduleMessage = "Вот тренировки на сегодня:\n";
    events.forEach(event => {
      scheduleMessage += `- ${event.date}: ${event.groupTitle}\n`; 
    });
  
    await ctx.reply(scheduleMessage);
  }
  module.exports = { getTodaySchedule };