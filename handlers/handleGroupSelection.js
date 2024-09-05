const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");
const { deleteMessageAfterDelay } = require("../helpers/deleteMessageAfterDelay");

async function handleGroupSelection(ctx) {
  const userMessageId = ctx.message.message_id;

  let replyMessageIds = [];

  try {
    const groupWithId = await Group.find({});

    if (groupWithId.length === 0) {
      const reply = await ctx.reply("No groups found.");
      replyMessageIds.push(reply.message_id);
      deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
      return;
    }

    // Создаем кнопки для клавиатуры
    const rows = groupWithId.map((group) => [
      {
        text: group.title,
        callback_data: JSON.stringify({ id: group._id, title: group.title }),
      },
    ]);
    const groupKeyboard = new InlineKeyboard(rows);

    const botMessage = await ctx.reply("Choose the group:", {
      reply_markup: groupKeyboard,
    });
  
    replyMessageIds.push(userMessageId);
    replyMessageIds.push(botMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } catch (error) {
    const errorMessage = await ctx.reply("Sorry, there was an error fetching the groups.");
    replyMessageIds.push(userMessageId);
    replyMessageIds.push(errorMessage.message_id);
    deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  }
}

module.exports = { handleGroupSelection };
