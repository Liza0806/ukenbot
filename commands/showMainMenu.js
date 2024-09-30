const { Keyboard } = require("grammy");

async function showMainMenu(ctx) {
  const mainMenu = new Keyboard()
    .text("🔍 Выбрать группу")
    .text("📝 Мои посещения")
    .row()
    .text("💰 Проверить оплату")
    .text("🌍 Перейти на сайт");

  await ctx.reply("Выбери действие:", {
    reply_markup: mainMenu.resized().oneTime(),
  });
}
async function showMainAdminMenu(ctx) {
  const mainMenu = new Keyboard()
    .text("🔍 График на сегодня")
    .text("📝 Написать 1 группе")
    .row()
    .text("Написать всем")
    .text("🌍 Перейти на сайт");

  await ctx.reply("Выбери действие:", {
    reply_markup: mainMenu.resized().oneTime(),
  });
}

module.exports = { showMainMenu, showMainAdminMenu };
