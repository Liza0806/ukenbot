const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");

const adminId = "1018007612"; // Преобразуем в строку для корректного сравнения

async function handleGroupSelection(ctx) {
  const userId = String(ctx.callbackQuery.from.id);

  try {
    const groupWithId = await Group.find({});
    if (groupWithId.length === 0) {
      await ctx.reply("🤔 Не найдено групп.");
      return; 
    }
    ctx.session.selectedGroupId = String(groupWithId._id);
    // Формируем строки для клавиатуры
    const rows = groupWithId.map((group) => [
      {
        text: `Группа ${group.title}`,
        callback_data:
          userId === adminId
            ? `message_${group._id}` // Для администратора
            : `events_${group._id}`, // Для обычного пользователя
      },
    ]);

    const groupKeyboard = new InlineKeyboard(rows);

    // Отправляем сообщение с клавиатурой
    await ctx.reply("📋 Выбери группу:", {
      reply_markup: groupKeyboard,
    });
  } catch (error) {
    console.error("Ошибка при загрузке групп:", error);
    await ctx.reply("🚨 Извините, произошла ошибка при загрузке групп.");
  }
}

module.exports = { handleGroupSelection };
