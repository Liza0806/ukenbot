const { Group } = require("../models/groupModel");
const { User } = require("../models/userModel");
const { Event } = require("../models/eventModel");
const {
  deleteMessageAfterDelay,
} = require("../helpers/deleteMessageAfterDelay");

async function yesHandler(ctx) {
  let replyMessageIds = [];

  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ telegramId: userId }).exec();
    if (!user) {
      const reply = await ctx.reply("User not found");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
    }
    if (!user.groups.includes(ctx.session.selectedGroup)) {
      user.groups.push(ctx.session.selectedGroup);
    }
    const group = await Group.findById(ctx.session.selectedGroup).exec();
    if (!group) {
      const reply = await ctx.reply("Group not found");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
    }
    const event = await Event.findById(ctx.session.nextEvent);
    if (!event) {
      const reply = await ctx.reply("Event not found");
      replyMessageIds.push(reply.message_id);
      return deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
    }
    const isAlreadyParticipant = event.participants.some(
      (p) => p.id === userId
    );
    if (isAlreadyParticipant) {
      const reply = await ctx.reply("Боец, ты уже отправлял, что идешь на тренировку)");
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
console.log(ctx.session)
await ctx.reply(`Поздравляю! Ты идешь на тренировку ${ctx.session.nextEventDate} в ${ctx.session.nextEventTime} вместе с гуппой ${ctx.session.groupTitle}`);

    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } catch (error) {
    const reply = await ctx.reply(
      "Sorry, there was an error adding you to the event."
    );
    replyMessageIds.push(reply.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  }
}

module.exports = { yesHandler };
