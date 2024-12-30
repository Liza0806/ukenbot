require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Bot, session, InlineKeyboard } = require("grammy");

const { registerCommand, start } = require("./commands/start");
const { handleGroupSelection } = require("./handlers/handleGroupSelection");
const { handleTextMessages } = require("./handlers/textMessages");
const { getTodaySchedule } = require("./handlers/getTodaySchedule");
const { yesHandler } = require("./handlers/yesHandler");
const { noHandler } = require("./handlers/noHandler");
const { handleBotError } = require("./handlers/errorHandler");
const { myEvents } = require("./handlers/myEvents");
const { goToSite } = require("./handlers/goToSite");
const { showMainMenu } = require("./commands/showMainMenu");
const { groupsCommand } = require("./commands/groups");
const sendMessageToOneGroup = require("./handlers/sendMessageToOneGroup");
const sendMessageToAllUsers = require("./handlers/sendMessageToAllUsers");

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
bot.command("start", (ctx) => showMainMenu(ctx)); ///// допиши команды

// ТОЛЬКО АДМИНУ: //////////////////////////////////////

bot.on("message:text", async (ctx) => {
  if (ctx.session.stage === "waiting_for_message_to_one_group") {
    try {
      // Отправляем сообщение группе
      await sendMessageToOneGroup(ctx, ctx.session.groupId);

      // Сброс состояния сессии
      ctx.session.stage = undefined;
      ctx.session.groupId = undefined;
    } catch (error) {
      console.error("Ошибка при отправке сообщения группе:", error);
      ctx.reply("Произошла ошибка. Попробуйте снова позже.");
    }
  }
  if (ctx.session.stage === "waiting_for_message_to_all_users") {
    try {
      // Отправляем сообщение группе
      await sendMessageToAllUsers(ctx);

      // Сброс состояния сессии
      ctx.session.stage = undefined;
    } catch (error) {
      console.error("Ошибка при отправке сообщения пользователям", error);
      ctx.reply(
        "Произошла ошибка при отправке сообщения пользователям. Попробуйте снова позже."
      );
    }
  }
});

bot.callbackQuery("write_to_all", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.stage = "waiting_for_message_to_all_users";
  await ctx.reply(
    "Введите текст, который хотите разослать всем пользователям."
  );
});

bot.callbackQuery("write_to_one_group", async (ctx) => {
  await ctx.answerCallbackQuery();
  // ctx.session.stage = "waiting_for_message_to_one_group";
  await handleGroupSelection(ctx);
});

bot.callbackQuery("schedule_today", async (ctx) => {
  await ctx.answerCallbackQuery();
  await getTodaySchedule(ctx);
});

bot.callbackQuery(/^message_([a-f0-9]{24})$/, async (ctx) => {
  const match = ctx.callbackQuery.data.match(/^message_([a-f0-9]{24})$/);
  ctx.session.stage = "waiting_for_message_to_one_group";

  if (match && match[1]) {
    ctx.session.groupId = match[1];
    await ctx.reply(
      "Введите текст, который хотите разослать пользователям группы."
    );
  } else {
    await ctx.reply("Не удалось извлечь ID события.");
  }
});

///////////////////////////////////////////////////

// ТОЛЬКО ЮЗЕРУ:

bot.callbackQuery("my_visits", async (ctx) => {
  await ctx.answerCallbackQuery();
  await myEvents(ctx);
});

bot.callbackQuery("accept_training", async (ctx) => {
  await ctx.answerCallbackQuery();
  await yesHandler(ctx);
}); //

bot.callbackQuery("cancel_training", async (ctx) => {
  await ctx.answerCallbackQuery();
  await noHandler(ctx);
}); //

bot.callbackQuery(/^events_([a-f0-9]{24})$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const match = ctx.callbackQuery.data.match(/^events_([a-f0-9]{24})$/);

  if (match && match[1]) {
    groupsCommand(ctx, match[1]);
  } else {
    await ctx.reply("Не удалось извлечь ID тренировки.");
  }
});
///////////////////////////////////////////////////

// ОБЩИЕ: ////////////////////////////////////////

bot.callbackQuery("startwork", async (ctx) => {
  await ctx.answerCallbackQuery(); // Подтверждаем нажатие кнопки
  await showMainMenu(ctx); // Показываем главное меню
}); //

bot.callbackQuery("register", async (ctx) => {
  await ctx.answerCallbackQuery();
  await registerCommand(ctx);
}); //

bot.callbackQuery("go_to_website", async (ctx) => {
  await ctx.answerCallbackQuery();
  await goToSite(ctx);
});

bot.callbackQuery("choose_group", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleGroupSelection(ctx);
});
//////////////////////////////////////////////////

// bot.on("callback_query:data", async (ctx) => {
//   ///callback_query:data - обработчик инлайн кнопок
//   const data = ctx.callbackQuery.data;
//   if (data === "register") {
//     await registerCommand(ctx); !!!
//   } else if (data === "startwork") {
//     await showMainMenu(ctx); !!!
//   } else if (ctx.session.stage === "nearest_training") {
//     ctx.session.selectedGroupId = data; // Сохраняем выбранный ID
//     await groupsCommand(ctx);
//   } else if (ctx.session.stage === "waiting_for_message") {
//     ctx.session.selectedGroupId = data; // Сохраняем выбранный ID группы
//     await ctx.reply(`Введите текст сообщения для отправки.`);
//   } else if (data === "accept_training") {
//     await yesHandler(ctx); !!!
//   } else if (data === "cancel_training") {
//     await noHandler(ctx); !!!
//   } else {
//     await ctx.reply("Неизвестная команда или формат данных.");
//   }
// });

bot.catch(handleBotError);

// Инициализация бота и запуск сервера
(async () => {
  await bot.init(); // Инициализация бота

  app.post("/webhook", (req, res) => {
    // console.log("Received update:", req.body);
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
