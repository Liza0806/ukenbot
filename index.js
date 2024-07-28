require('dotenv').config();
const mongoose = require('mongoose');
const { Bot, Keyboard, InlineKeyboard, session, GrammyError, HttpError } = require('grammy');
const moment = require('moment');
const { User } = require('./models/userModel');
const { Group } = require('./models/groupModel');
const { v4: uuidv4 } = require('uuid'); 

// Подключение к базе данных
mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const bot = new Bot(process.env.BOT_API_KEY);

// Инициализация сессий
bot.use(session({ initial: () => ({}) }));

// Команда для начала регистрации
bot.command('register', async (ctx) => {
    ctx.session.registrationStep = 1;
    await ctx.reply('Please enter your name:');
});

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
    try {
        if (ctx.session.registrationStep === 1) {
            ctx.session.registrationName = ctx.message.text;
            ctx.session.registrationStep = 2;
            await ctx.reply('Please enter your email address:');
        } else if (ctx.session.registrationStep === 2) {
            ctx.session.registrationEmail = ctx.message.text;
            ctx.session.registrationStep = 3;
            await ctx.reply('Please enter your password:');
        } else if (ctx.session.registrationStep === 3) {
            ctx.session.registrationPassword = ctx.message.text;
            ctx.session.registrationStep = 4;

            // Получение доступных групп
            const groups = await Group.find({}).exec();
            const groupList = groups.map((group) => ({
                text: group.title,
                callback_data: `group_${group._id}`,
            }));
            const rows = groupList.map((g) => [g]);
            const groupKeyboard = new InlineKeyboard(rows);

            await ctx.reply('Please select the groups you want to join:', {
                reply_markup: groupKeyboard,
            });
        } else if (ctx.session.registrationStep === 5) {
            if (ctx.message.text === ctx.session.verificationToken) {
                const user = new User({
                    telegramId: ctx.from.id.toString(),
                    name: ctx.session.registrationName,
                    email: ctx.session.registrationEmail,
                    password: ctx.session.registrationPassword,
                    groups: ctx.session.registrationGroups,
                    createdAt: new Date(),
                    token: ctx.session.verificationToken,
                    verify: true,
                    verificationCode: ctx.session.verificationCode,
                });

                await user.save();
                await ctx.reply('Registration successful!');
                ctx.session = {}; // Очистить сессию
            } else {
                await ctx.reply('Invalid token. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error processing registration step:', error);
        await ctx.reply('Sorry, there was an error processing your request.');
    }
});

// Обработка нажатий на кнопки выбора групп
bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('group_')) {
        const groupId = data.split('_')[1];
        ctx.session.registrationGroups = ctx.session.registrationGroups || [];
        ctx.session.registrationGroups.push(groupId);

        const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
        ctx.session.verificationCode = verificationCode;
        ctx.session.verificationToken = uuidv4();

        await ctx.reply(`Your verification token is: ${ctx.session.verificationToken}. Please send this token to verify your registration.`);
        ctx.session.registrationStep = 5;
    } else if (data === 'login_with_telegram') {
        const authUrl = `https://t.me/${process.env.BOT_USERNAME}?start=auth_${ctx.from.id}`;

        await ctx.reply('Click the link to authenticate:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Authenticate', url: authUrl }],
                ],
            },
        });
    } else if (data.startsWith('group_')) {
        const groupId = data.split('_')[1];
        const group = await Group.findById(groupId).exec();

        if (!group) {
            return ctx.reply('Group not found');
        }

        const today = moment();
        const events = group.events.filter(event => !event.isCancelled && moment(event.date).isAfter(today));

        if (events.length === 0) {
            return ctx.reply('No upcoming events found');
        }

        const nextEvent = events.sort((a, b) => moment(a.date) - moment(b.date))[0];
        const eventDate = moment(nextEvent.date).format('YYYY-MM-DD');
        const eventTime = moment(nextEvent.date).format('HH:mm');

        await ctx.reply(`The next event is on ${eventDate} at ${eventTime}. Will you go to this event?`, {
            reply_markup: new Keyboard()
                .text('yes')
                .text('no')
                .resized()
                .oneTime(),
        });
    }
});

// Команда для начала
bot.command('start', async (ctx) => {
    const loginKeyboard = new InlineKeyboard()
        .text('Login with Telegram', 'login_with_telegram');

    await ctx.reply('Please login using the button below:', {
        reply_markup: loginKeyboard,
    });
});

// Команда для выбора группы
bot.command('group', async (ctx) => {
    try {
        const groups = await Group.find({});
        const groupList = groups.map((group) => ({
            text: group.title,
            callback_data: `group_${group._id}`,
        }));
        const rows = groupList.map((g) => [g]);
        const groupKeyboard = new InlineKeyboard(rows);

        await ctx.reply('Choose the group', {
            reply_markup: groupKeyboard,
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        await ctx.reply('Sorry, there was an error fetching the groups.');
    }
});

// Обработка ответов на участие в событии
bot.hears('yes', async (ctx) => {
    // Добавьте логику для добавления участника в событие и группу
    await ctx.reply('You are added to the event!');
});

bot.hears('no', async (ctx) => {
    await ctx.reply('You have not joined the event.');
});

// Обработка ошибок
bot.catch((err) => {
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
});

// Установка команд бота
bot.api.setMyCommands([
    {
        command: 'group',
        description: 'Choose your group',
    },
    {
        command: 'register',
        description: 'Start registration',
    },
    {
        command: 'payment',
        description: 'Check your monthly payment status',
    },
]);
bot.command('group', async (ctx) => {
    try {
      const groups = await Group.find().select('name -_id');
      const groupList = groups.map((group) => group.name);
  
      const rows = groupList.map((g) => [Keyboard.text(g)]);
      const groupKeyboard = Keyboard.from(rows).resized();
  
      await ctx.reply('Choose the group', {
        reply_markup: groupKeyboard,
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      await ctx.reply('Sorry, there was an error fetching the groups.');
    }
  });
  
  bot.hears(/group\d+/, async (ctx) => {
    const groupName = ctx.match[0];
    try {
      const group = await Group.findOne({ name: groupName });
  
      if (!group) {
        return ctx.reply('Group not found');
      }
  
      const today = moment();
      const schedule = group.schedule.map((s) => ({
        ...s,
        nextDate: moment().day(s.day).hour(parseInt(s.time.split(':')[0])).minute(parseInt(s.time.split(':')[1])),
      }));
  
      const nextEvent = schedule
        .filter((s) => s.nextDate.isAfter(today))
        .sort((a, b) => a.nextDate - b.nextDate)[0];
  
      const eventDate = nextEvent.nextDate.format('YYYY-MM-DD');
      const eventTime = nextEvent.time;
  
      const eventKeyboard = new Keyboard()
        .text('yes')
        .text('no')
        .resized()
        .oneTime();
  
      await ctx.reply(`The next event is on ${eventDate} at ${eventTime}. Will you go to this event?`, {
        reply_markup: eventKeyboard,
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      await ctx.reply('Sorry, there was an error fetching the group.');
    }
  });
// Запуск бота
bot.start();
