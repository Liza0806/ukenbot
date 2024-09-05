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
      const reply = await ctx.reply("User not found");
      replyMessageIds.push(reply.message_id);
      return;
    }
    const group = await Group.findById(ctx.session.selectedGroup).exec();
    if (!group) {
      const reply = await ctx.reply("Group not found");
      replyMessageIds.push(reply.message_id);
      return;
    }

    const event = await Event.findById(ctx.session.nextEvent);
    if (!event) {
      const reply = await ctx.reply("Event not found");
      replyMessageIds.push(reply.message_id);
      return;
    }

    event.participants = event.participants.filter((p) => p.id !== userId);
    await event.save();

    user.visits = user.visits.filter((v) => v.eventId !== event._id);
    await user.save();

    await ctx.reply(`Даже у самых сильных иногда бывают минуты слабости! Ты не идешь на тренировку ${ctx.session.nextEventDate} в ${ctx.session.nextEventTime} вместе с гуппой ${ctx.session.groupTitle}`);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } catch (error) {
    await ctx.reply("Sorry, there was an error removing you from the event."); // это сообщение должно быть удалено спустя 5 секунд
    replyMessageIds.push(reply.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  }
}

module.exports = { noHandler };
