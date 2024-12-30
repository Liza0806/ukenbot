const { Group } = require("../models/groupModel");
const sendMessagesToUsers = require("../helpers/sendMessagesToUsers");

const sendMessageToOneGroup = async (ctx, selectedGroupId) => {
  const messageText = ctx.message?.text;
  let users;
  if (!messageText) {
    ctx.reply("Пожалуйста, введите текст для рассылки группе.");
  }
  try {
    const group = await Group.findById(selectedGroupId);
    if (group) {
      users = group.participants; // Получаем участников группы
      if (users.length === 0) {
        return ctx.reply("В группе нет участников для рассылки.");
      }
    } else {
      return ctx.reply("Группа не найдена.");
    }
    try {
      await sendMessagesToUsers(ctx, users, messageText);
      await ctx.reply(`Сообщение успешно отправлено группе ${group.title}`);
    } catch (err) {
      ctx.reply(`Лиза, переделывай ${err}`);
    }
  } catch (err) {
    console.error("Ошибка при рассылке сообщений:", err);
    ctx.reply("Произошла ошибка при рассылке сообщений.");
  }
};

module.exports = sendMessageToOneGroup;
