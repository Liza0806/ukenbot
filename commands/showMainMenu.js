// const { Keyboard } = require("grammy");
const { InlineKeyboard } = require("grammy");
let mainMenu;
async function showMainMenu(ctx) {
  ctx.message.from.id === 1018007612
    ? (mainMenu = new InlineKeyboard()
        .text("🔍 График на сегодня", "schedule_today")
        .text("📝 Написать 1 группе", "write_to_one_group")
        .row()
        .text("Написать всем", "write_to_all")
        .text("🌍 Перейти на сайт", "go_to_website"))
    : (mainMenu = new InlineKeyboard()
        .text("🔍 Выбрать группу", "choose_group")
        .text("📝 Мои посещения", "my_visits")
        .row()
        .text("💰 Проверить оплату", "check_payment")
        .text("🌍 Перейти на сайт", "go_to_website"));

  await ctx.reply("Выбери действие:", {
    reply_markup: mainMenu,
  });
}

module.exports = { showMainMenu };
