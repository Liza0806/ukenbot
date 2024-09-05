require("dotenv").config();
const mongoose = require("mongoose");
const { Bot, session } = require("grammy");

const { registerCommand, start } = require("./commands/start");
const { groupsCommand } = require("./commands/groups");
const { handleGroupSelection } = require("./handlers/handleGroupSelection");
const { handleTextMessages } = require("./handlers/textMessages");
const { yesHandler } = require("./handlers/yesHandler");
const { noHandler } = require("./handlers/noHandler");
const { handleBotError } = require("./handlers/errorHandler");
const { showMainMenu } = require("./commands/showMainMenu");

// Подключение к базе данных
mongoose.connect(process.env.DB_HOST);

const bot = new Bot(process.env.BOT_API_KEY);

// Инициализация сессий
bot.use(session({ initial: () => ({}) }));

// Команда для начала регистрации
bot.command("register", registerCommand);

// Команда для выбора группы
bot.hears("🔍 Выбрать группу", handleGroupSelection);

bot.command("start", start);

// Обработка нажатия на кнопку "Начать регистрацию"
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === "register") {
    await registerCommand(ctx);
  } else if (data === "startwork") {
    await showMainMenu(ctx);
  } else if (data.startsWith("{")) {
    try {
      const parsedData = JSON.parse(data);

      if (parsedData.id && parsedData.title) {
        await groupsCommand(ctx);
      } else {
        await ctx.reply("Invalid JSON format.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      await ctx.reply("Error processing data.");
    }
  } else if (data === "accept_training") {
    await yesHandler(ctx);
  } else if (data === "cancel_training") {
    await noHandler(ctx);
  } else {
    await ctx.reply("Unknown command or data format.");
  }
});

bot.callbackQuery("cancel_training", noHandler);

// Обработка текстовых сообщений
bot.on("message:text", handleTextMessages);

// Обработка ошибок
bot.catch(handleBotError);

module.exports = (req, res) => {
    bot.start();
    res.status(200).send("Bot is running");
  };