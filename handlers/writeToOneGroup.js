const { Group } = require("../models/groupModel");

const writeToOneGroup = async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      const groups = await Group.find({});
  
      if (groups.length === 0) {
        return ctx.reply("🤔 Не найдено групп.");
      }
  
      const rows = groups.map((group) => [
        {
          text: `Написать ${group.title}`,
          callback_data: String(group._id),
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

  module.exports = writeToOneGroup;