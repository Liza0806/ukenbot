const { Event } = require("../models/eventModel");
const moment = require("moment");
const { InlineKeyboard } = require("grammy");

async function groupsCommand(ctx) {
  try {
    const callbackData = JSON.parse(ctx.callbackQuery.data);

    const groupId = callbackData.id;
    const groupTitle = callbackData.title;
    const events = await Event.find({ groupId: groupId }).exec();
    if (!events) {
      return ctx.reply("⚠️ Events not found");
    }

    const today = moment();
    const upcomingEvents = events.filter(
      (event) => !event.isCancelled && moment(event.date).isAfter(today)
    );

    if (upcomingEvents.length === 0) {
      return ctx.reply("🚫 No upcoming events found");
    }

    const nextEvent = upcomingEvents.sort(
      (a, b) => moment(a.date) - moment(b.date)
    )[0];
    const eventDate = moment(nextEvent.date).format("YYYY-MM-DD");
    const eventTime = moment(nextEvent.date).format("HH:mm");

    ctx.session.selectedGroup = groupId;
    ctx.session.nextEventDate = eventDate;
    ctx.session.nextEventTime = eventTime;
    ctx.session.nextEvent = nextEvent._id;
    ctx.session.groupTitle = groupTitle;

    console.log(" ctx.session", ctx.session);

    const inlineKeyboard = new InlineKeyboard()
      .text("✅ Пойду", "accept_training")
      .text("🚫 Не пойду", "cancel_training");

    await ctx.reply(
      `📅 Следующая тренировка будет ${eventDate} в ${eventTime}. Пойдешь?`,
      {
        reply_markup: inlineKeyboard,
      }
    );
  } catch (error) {
    await ctx.reply("❗️ Sorry, there was an error processing your request.");
  }
}

module.exports = { groupsCommand };
