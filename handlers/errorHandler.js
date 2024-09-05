const { GrammyError, HttpError } = require('grammy');

function handleBotError(err) {
    const ctx = err.ctx;
    console.error(`Error handling update ${ctx.update.update_id}`);
    
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Could not connect to Telegram:', e);
    } else {
        console.error('Unknown error:', e);
    }
}

module.exports = { handleBotError };
