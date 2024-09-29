const { Keyboard } = require("grammy");

async function showMainMenu(ctx) {
  const mainMenu = new Keyboard()
    .text("🔍 Выбрать группу")
    .text("📝 Мои посещения")
    .row()
    .text("💰 Проверить оплату")
    .text("🌍 На сайт");

  await ctx.reply("Выберите действие:", {
    reply_markup: mainMenu.resized().oneTime(),
  });
}

module.exports = { showMainMenu };
