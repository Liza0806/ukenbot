const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");
const { deleteMessageAfterDelay } = require("../helpers/deleteMessageAfterDelay");

async function handleGroupSelection(ctx) {
  const userMessageId = ctx.message.message_id;

  let replyMessageIds = [];

  try {
    const groupWithId = await Group.find({});

    if (groupWithId.length === 0) {
      const reply = await ctx.reply("🤔 Не найдено групп.");
      replyMessageIds.push(reply.message_id);
      deleteMessageAfterDelay(ctx, replyMessageIds, 500);
      return;
    }

    const rows = groupWithId.map((group) => [
      {
        text: group.title,
        callback_data: JSON.stringify({ id: group._id, title: group.title }),
      },
    ]);
    const groupKeyboard = new InlineKeyboard(rows);

    const botMessage = await ctx.reply("📋 Выбери группу:", {
      reply_markup: groupKeyboard,
    });

    replyMessageIds.push(userMessageId);
    replyMessageIds.push(botMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } catch (error) {
    const errorMessage = await ctx.reply(
      "🚨 Извините, произошла ошибка при загрузке групп."
    );
    replyMessageIds.push(userMessageId);
    replyMessageIds.push(errorMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  }
}

module.exports = { handleGroupSelection };
