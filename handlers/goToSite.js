const { User } = require("../models/userModel");

async function goToSite(ctx) {
  const userId = ctx.from.id;

  const user = await User.findOne({ "telegramId": userId });

  if (!user) {
    return ctx.reply("Пользователь не найден.");
  }

  if (!user.isAdmin) {
    return ctx.reply(`https://uken.netlify.app/users/${user._id}`); // `https://uken.netlify.app/users/${user._id}`
  }

  return ctx.reply("https://uken.netlify.app/events");
}

module.exports = { goToSite };
