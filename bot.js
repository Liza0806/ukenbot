require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
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

const app = express();
const port = process.env.PORT || 3000;

// Подключение к базе данных
mongoose.connect(process.env.DB_HOST);

// Инициализация бота
const bot = new Bot(process.env.BOT_API_KEY);
bot.use(session({ initial: () => ({}) }));

// Команды и обработчики
bot.command("register", registerCommand);
bot.hears("🔍 Выбрать группу", handleGroupSelection);
bot.command("start", start);

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
bot.on("message:text", handleTextMessages);
bot.catch(handleBotError);

// Обработка POST-запросов от Telegram
app.use(bodyParser.json());
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = (req, res) => {
  res.status(200).send("Bot is running");
};
