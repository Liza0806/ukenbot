const { InlineKeyboard } = require("grammy");

async function start(ctx) {
  const startKeyboard = new InlineKeyboard().text(
    "Начать регистрацию 🥊",
    "register"
  );

  await ctx.reply("Привет! Чтобы начать регистрацию, нажмите кнопку ниже:", {
    reply_markup: startKeyboard,
  });
}

async function registerCommand(ctx) {
  ctx.session.registrationStep = 1;
  await ctx.reply("Введи свое имя:");
}

module.exports = { start, registerCommand };
