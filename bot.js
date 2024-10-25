require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Bot, session, InlineKeyboard } = require("grammy");

const { registerCommand, start } = require("./commands/start");
const { handleGroupSelection } = require("./handlers/handleGroupSelection");
const { handleTextMessages } = require("./handlers/textMessages");
const { yesHandler } = require("./handlers/yesHandler");
const { noHandler } = require("./handlers/noHandler");
const { handleBotError } = require("./handlers/errorHandler");
const { myEvents } = require("./handlers/myEvents");
const { goToSite } = require("./handlers/goToSite");
const { showMainMenu } = require("./commands/showMainMenu");
const { groupsCommand } = require("./commands/groups");
const { User } = require("./models/userModel");
const { Group } = require("./models/groupModel");

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// Подключение к базе данных
mongoose
  .connect(process.env.DB_HOST)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Инициализация бота
const bot = new Bot(process.env.BOT_API_KEY);
bot.use(
  session({
    initial: () => ({ stage: null, messageText: "", selectedGroupId: null }),
  })
);
const adminId = 1007855799;

// Команды и обработчики
bot.command("register", registerCommand);

bot.hears("🔍 Выбрать группу", handleGroupSelection);

bot.hears("📝 Мои посещения", myEvents);

bot.hears("🌍 Перейти на сайт", goToSite);

bot.hears("Написать всем", (ctx) => {
  ctx.session.stage = "waiting_for_message";
  ctx.reply("Введите текст, который хотите разослать всем пользователям.");
});

bot.hears("📝 Написать 1 группе", handleGroupSelection);

bot.hears("🔍 График на сегодня", getTodaySchedule);

bot.on("message:text", async (ctx) => {
  /// когда вы используете bot.on('message', ...), событие message срабатывает каждый раз, когда бот получает входящее сообщение от пользователя
  if (ctx.session.stage === "waiting_for_message") {
    await sendMessage(ctx);
  } /// тут мы пишем ВСЕМ
  ctx.session.selectedGroupId = "";
});

bot.command("start", start);

bot.on("callback_query:data", async (ctx) => {
  ///callback_query:data - обработчик инлайн кнопок
  const data = ctx.callbackQuery.data;
  if (data === "register") {
    await registerCommand(ctx);
  } else if (data === "startwork") {
    await showMainMenu(ctx);
  } else if (ctx.session.stage === "nearest_training") {
    ctx.session.selectedGroupId = data; // Сохраняем выбранный ID
    await groupsCommand(ctx);
  } else if (ctx.session.stage === "waiting_for_message") {
    ctx.session.selectedGroupId = data; // Сохраняем выбранный ID группы
    await ctx.reply(`Введите текст сообщения для отправки.`);
  } else if (data === "accept_training") {
    await yesHandler(ctx);
  } else if (data === "cancel_training") {
    await noHandler(ctx);
  } else {
    await ctx.reply("Неизвестная команда или формат данных.");
  }
});

bot.callbackQuery("cancel_training", noHandler);
bot.on("message:text", handleTextMessages);
bot.catch(handleBotError);

// Инициализация бота и запуск сервера
(async () => {
  await bot.init(); // Инициализация бота

  app.post("/webhook", (req, res) => {
    console.log("Received update:", req.body);
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

const writeToOneGroup = async (ctx) => {
  try {
    const groups = await Group.find({});

    if (groups.length === 0) {
      return ctx.reply("🤔 Не найдено групп.");
    }

    const rows = groups.map((group) => [
      {
        text: `Написать ${group.title}`,
        callback_data: group._id, /// JSON.stringify({ id: group._id, title: group.title }),
      },
    ]);
    const groupKeyboard = new InlineKeyboard(rows);

    await ctx.reply("📋 Выбери группу:", {
      reply_markup: groupKeyboard,
    });
  } catch (error) {
    console.error("Ошибка при загрузке групп:", error);
    await ctx.reply("🚨 Извините, произошла ошибка при загрузке групп.");
  }
};

const sendMessage = async (ctx) => {
  if (ctx.session.stage === "waiting_for_message") {
    const messageText = ctx.message.text;

    if (!messageText) {
      return ctx.reply("Пожалуйста, введите текст для рассылки.");
    }

    ctx.session.messageText = messageText; // Сохраняем текст в сессии
    ctx.session.stage = ""; // Сбрасываем этап
    let selectedGroupId = ctx.session.selectedGroupId; // Получаем выбранный ID группы
    try { 
      
      let users;
      if (selectedGroupId) {
        const group = await Group.findById(selectedGroupId);
        if (group) {
          users = group.participants; // Получаем участников группы
        } else {
          return ctx.reply("Группа не найдена.");
        }
        //  ctx.session.selectedGroupId = undefined
      } else {
        users = await User.find({ telegramId: { $exists: true } });
        //  ctx.session.selectedGroupId = undefined
      }

      for (let user of users) {
        try {
          await ctx.api.sendMessage(user.telegramId, messageText); // Рассылаем сообщение
        } catch (err) {
          console.error(
            `Не удалось отправить сообщение пользователю с ID ${user.telegramId}:`,
            err
          );
        }
      }

      // Сбрасываем ID группы после рассылки
    } catch (err) {
      console.error("Ошибка при рассылке сообщений:", err);
      ctx.reply("Произошла ошибка при рассылке сообщений.");
    } finally {
      selectedGroupId
        ? await ctx.reply(`Сообщение успешно отправлено пользователям группы`)
        : await ctx.reply("Сообщение успешно отправлено всем пользователям.");

      ctx.session.selectedGroupId = undefined;
    }
  }
};

const getTodaySchedule = async (ctx) => {
  const userId = ctx.from.id.toString();
  const now = new Date();
  const startOfDay = new Date(now.getDay(), now.getDay(), 1); //начало дня 
  const endOfDay = new Date(now.getDay(), now.getDay() + 1, 0); // конец дня
  const events = await Event.find({ date: { $gte: startOfDay, $lte: endOfDay },})
  if (events.length === 0) {
    const reply = await ctx.reply("Костя сегодня свободен!");
    return;
  }
  let scheduleMessage = "Вот тренировки на сегодня:\n";
  events.forEach(event => {
    scheduleMessage += `- ${event.date}: ${event.groupTitle}\n`; 
  });

  await ctx.reply(scheduleMessage);
}
