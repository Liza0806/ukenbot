const { InlineKeyboard } = require("grammy");
const { User } = require("../models/userModel");
const { showMainMenu, showMainAdminMenu } = require("../commands/showMainMenu");
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
  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ telegramId: userId }).exec();
    console.log(user, 'user')
    if (!user.isAdmin) {
      console.log('not admin')
      // Если пользователь уже зарегистрирован
      await ctx.reply("Ты уже зарегистрирован!");
      await showMainMenu(ctx); // Показываем главное меню
    } 
    else if (user.isAdmin) {
      console.log('admin')
      // Если пользователь уже зарегистрирован
      await ctx.reply("Привет, Костя!");
      await showMainAdminMenu(ctx); // Показываем главное меню
    } 
    else {
      // Если пользователь не найден, начинаем регистрацию
      ctx.session.registrationStep = 1;
      await ctx.reply("Введи свое имя:");
    }
  } catch (error) {
    // Обрабатываем ошибки запроса
    console.error("Ошибка при проверке пользователя:", error);
    await ctx.reply("Произошла ошибка. Попробуй снова.");
  }
}

module.exports = { start, registerCommand };
