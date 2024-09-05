require("dotenv").config();
const mongoose = require("mongoose");
const { Bot, session } = require("grammy");

const { registerCommand } = require("./commands/register");
const { groupsCommand } = require("./commands/groups");
const { handleGroupSelection } = require("./handlers/handleGroupSelection");
const { handleTextMessages } = require("./handlers/textMessages");
const { yesHandler } = require("./handlers/yesHandler");
const { noHandler } = require("./handlers/noHandler");
const { handleBotError } = require("./handlers/errorHandler");

// Подключение к базе данных
mongoose.connect(process.env.DB_HOST);

const bot = new Bot(process.env.BOT_API_KEY);

// Инициализация сессий
bot.use(session({ initial: () => ({}) }));

// Команда для начала регистрации
bot.command("register", registerCommand);

// Команда для выбора группы
bot.command("groups", handleGroupSelection);

// Обработка ответов на участие в событии
bot.hears("yes", yesHandler);

bot.hears("no", noHandler);

// Обработка текстовых сообщений
bot.on("message:text", handleTextMessages);

// Обработка нажатий на кнопки выбора групп
bot.on("callback_query:data", groupsCommand);

// Обработка ошибок
bot.catch(handleBotError);

// Установка команд бота
bot.api.setMyCommands([
  {
    command: "groups",
    description: "Choose your group",
  },
  {
    command: "register",
    description: "Start registration",
  },
  {
    command: "payment",
    description: "Check your monthly payment status",
  },
]);

bot.start();
