const { User } = require("../models/userModel");

async function goToSite(ctx) {
  const userId = ctx.from.id;

  const user = await User.findOne({ "telegramId": userId });

  if (!user) {
    return ctx.reply("Пользователь не найден.");
  }

  if (!user.isAdmin) {
    return ctx.reply(`hello`); // `https://uken.netlify.app/users/${userId}`
  }

  return ctx.reply("https://uken.netlify.app/events");
}

module.exports = { goToSite };
