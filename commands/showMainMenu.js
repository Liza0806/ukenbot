// const { Keyboard } = require("grammy");
const { InlineKeyboard } = require("grammy");
const { User } = require("../models/userModel");

 let mainMenu;

// async function showMainMenu(ctx) {
//   const user = await User.findOne({ telegramId: ctx.message.from.id });
//   console.log(user)
//   if(!user){
//     mainMenu = new InlineKeyboard()
//     .text("✍️ Регистрация", "registration")
//   }
//   if(ctx.message.from.id === 1018007612){
//     mainMenu = new InlineKeyboard()
//         .text("🔍 График на сегодня", "schedule_today")
//         .text("📝 Написать 1 группе", "write_to_one_group")
//         .row()
//         .text("Написать всем", "write_to_all")
//         .text("🌍 Перейти на сайт", "go_to_website")
//   }
//  else (mainMenu = new InlineKeyboard()
//         .text("🔍 Выбрать группу", "choose_group")
//         .text("📝 Мои посещения", "my_visits")
//         .row()
//         .text("💰 Проверить оплату", "check_payment")
//         .text("🌍 Перейти на сайт", "go_to_website"));
        

//   await ctx.reply("Выбери действие:", {
//     reply_markup: mainMenu,
//   });
// }

// module.exports = { showMainMenu };


async function showMainMenu(ctx) {
  const from = ctx.from;
  const user = await User.findOne({ telegramId: from.id});
  console.log(user);

  if (!user) {
    const registrationMenu = new InlineKeyboard().text("✍️ Регистрация", "registration");
    await ctx.reply("Пожалуйста, зарегистрируйся:", {
      reply_markup: registrationMenu,
    });
    return; // ВАЖНО! Прерываем выполнение, дальше меню не строим
  }

  if (from.id === 1018007612) {
    mainMenu = new InlineKeyboard()
      .text("🔍 График на сегодня", "schedule_today")
      .text("📝 Написать 1 группе", "write_to_one_group")
      .row()
      .text("Написать всем", "write_to_all")
      .text("🌍 Перейти на сайт", "go_to_website");
  } else {
    mainMenu = new InlineKeyboard()
      .text("🔍 Выбрать группу", "choose_group")
      .text("📝 Мои посещения", "my_visits")
      .row()
      .text("💰 Проверить оплату", "check_payment")
      .text("🌍 Перейти на сайт", "go_to_website");
  }

  await ctx.reply("Выбери действие:", {
    reply_markup: mainMenu,
  });
}
module.exports = { showMainMenu };