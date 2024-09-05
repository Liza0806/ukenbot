const deleteMessageAfterDelay = async (ctx, messageIds, delay = 10000) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, delay));
        for (const messageId of messageIds) {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, messageId);
            } catch (error) {
                console.error(`Error deleting message with ID ${messageId}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in deleteMessagesAfterDelay:', error);
    }
};

module.exports = { deleteMessageAfterDelay };
