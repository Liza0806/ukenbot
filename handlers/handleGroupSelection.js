const { InlineKeyboard } = require("grammy");
const { Group } = require("../models/groupModel");
const { deleteMessageAfterDelay } = require("../helpers/deleteMessageAfterDelay");
// const { adminId } = require("../bot");
  const adminId = 1018007612;
async function handleGroupSelection(ctx) {

  const userId = ctx.message.from.id;
 console.log(userId, '-userId')
if(userId === adminId){
  ctx.session.stage = "waiting_for_message";
} else {
  ctx.session.stage = "nearest_training";
}

  let replyMessageIds = [];

  try {
    const groupWithId = await Group.find({});

    if (groupWithId.length === 0) {
      const reply = await ctx.reply("🤔 Не найдено групп.");
 //     replyMessageIds.push(reply.message_id);
   //   deleteMessageAfterDelay(ctx, replyMessageIds, 500);
      return;
    }

    const rows = groupWithId.map((group) => [
      {
        text:`Группа ${group.title}`,
        callback_data:  group._id,
      },
    ]);
   // ctx.session.stage = 'chose_group_for_training';
    const groupKeyboard = new InlineKeyboard(rows);

    const botMessage = await ctx.reply("📋 Выбери группу:", {
      reply_markup: groupKeyboard,
    });

  //  replyMessageIds.push(userMessageId);
   // replyMessageIds.push(botMessage.message_id);
   // deleteMessageAfterDelay(ctx, replyMessageIds, 5000);
  } catch (error) {
    const errorMessage = await ctx.reply(
      "🚨 Извините, произошла ошибка при загрузке групп."
    );
   // replyMessageIds.push(userMessageId);
   // replyMessageIds.push(errorMessage.message_id);
   // deleteMessageAfterDelay(ctx, replyMessageIds, 500);
  }
}

module.exports = { handleGroupSelection };
