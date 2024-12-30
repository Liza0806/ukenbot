const { User } = require("../models/userModel");
const { InlineKeyboard } = require("grammy");
const bcrypt = require('bcryptjs');

async function handleTextMessages(ctx) {

  if (ctx.session.registrationStep === 1) {
    ctx.session.registrationName = ctx.message.text;
    ctx.session.registrationStep = 2;

    await ctx.reply("Введите ваш пароль 🛡️:");
  } else if (ctx.session.registrationStep === 2) {
    ctx.session.registrationPassword = ctx.message.text;
    ctx.session.registrationStep = 3;

    await ctx.reply('Подтвердите регистрацию, набрав "uken" 🔑');
  } else if (
    ctx.session.registrationStep === 3 &&
    ctx.message.text.toLowerCase() === "uken"
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

    const startKeyboard = new InlineKeyboard().text("Погнали? 🚀", "startwork");

    await ctx.reply("Регистрация успешна! Добро пожаловать в UKEN TEAM 🎉", {
      reply_markup: startKeyboard,
    });
  }
}

module.exports = { handleTextMessages };
