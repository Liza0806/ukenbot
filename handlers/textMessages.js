const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const {
  deleteMessageAfterDelay,
} = require("../helpers/deleteMessageAfterDelay");

async function handleTextMessages(ctx) {
  let replyMessageIds = [];

  if (ctx.session.registrationStep === 1) {
    ctx.session.registrationName = ctx.message.text;
    ctx.session.registrationStep = 2;
    await ctx.reply("Please enter your password:");
    replyMessageIds.push(reply.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } else if (ctx.session.registrationStep === 2) {
    ctx.session.registrationPassword = ctx.message.text;
    ctx.session.registrationStep = 3;
    await ctx.reply('Confirm your registration by typing "confirm"');
    replyMessageIds.push(reply.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } else if (
    ctx.session.registrationStep === 3 &&
    ctx.message.text.toLowerCase() === "confirm"
  ) {
    const hashedPassword = await bcrypt.hash(
      ctx.session.registrationPassword,
      10
    );
    const user = new User({
      telegramId: ctx.from.id.toString(),
      name: ctx.session.registrationName,
      password: hashedPassword,
      groups: [],
      createdAt: new Date(),
    });
    await user.save();
    await ctx.reply("Registration successful!");
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
    ctx.session = {};
  }
}

module.exports = { handleTextMessages };
