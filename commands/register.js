async function registerCommand(ctx) {
    ctx.session.registrationStep = 1;
    await ctx.reply('Please enter your name:');
}

module.exports = { registerCommand };
