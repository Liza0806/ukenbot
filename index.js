require('dotenv').config();
const mongoose = require('mongoose');
const { Bot, Keyboard, InlineKeyboard, session, GrammyError, HttpError } = require('grammy');
const moment = require('moment');
const { User } = require('./models/userModel');
const { Event } = require('./models/eventModel');
const { Group } = require('./models/groupModel');
const bcrypt = require("bcrypt");

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
    console.log('Register command received');
    ctx.session.registrationStep = 1;
    await ctx.reply('Please enter your name:');
});

// Команда для начала
bot.command('start', async (ctx) => {
    console.log('Start command received');
    const loginKeyboard = new InlineKeyboard()
        .text('Login with Telegram', 'login_with_telegram');

    await ctx.reply('Please login using the button below:', {
        reply_markup: loginKeyboard,
    });
});

// Команда для выбора группы
bot.command('groups', async (ctx) => {
    console.log('Groups command received');
    try {
        // Получаем уникальные значения поля 'group' из коллекции 'events'
        const groupIds = await Event.distinct('group');
        console.log('Unique group IDs:', groupIds);

        // Находим полные данные групп по их идентификаторам
        const groups = await Promise.all(groupIds.map(id => Group.findById(id)));
        
        // Формируем массив с данными групп (идентификатор и название)
        const groupWithId = groups.map(group => ({
            id: group._id.toString(), // Преобразуем идентификатор в строку
            title: group.title
        }));
        
        // Создаем кнопки для клавиатуры
        const rows = groupWithId.map(group => [{
            text: group.title,
            callback_data: group.id
        }]);
        const groupKeyboard = new InlineKeyboard(rows);

        // Отправляем сообщение с клавиатурой
        await ctx.reply('Choose the group:', {
            reply_markup: groupKeyboard,
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        await ctx.reply('Sorry, there was an error fetching the groups.');
    }
});

// Обработка ответов на участие в событии
bot.hears('yes', async (ctx) => {
    console.log('Yes received');
    try {
      const userId = ctx.from.id.toString();
      const user = await User.findOne({ telegramId: userId }).exec();
      if (!user) {
        return ctx.reply('User not found');
      }
      console.log(user, user.groups, ctx.session.selectedGroup)
  if(!user.groups.includes(ctx.session.selectedGroup)){
    user.groups.push(ctx.session.selectedGroup)
  }
      const group = await Group.findById(ctx.session.selectedGroup).exec();
      console.log(group)
      if (!group) {
        return ctx.reply('Group not found');
      }
  
      const event = await Event.findById(ctx.session.nextEvent);
      if (!event) {
        return ctx.reply('Event not found');
      }
console.log(event, 'event')
      // Проверка, есть ли пользователь уже в списке участников
      const isAlreadyParticipant = event.participants.some(p => p.id === userId);
      if (isAlreadyParticipant) {
        return ctx.reply('You are already added to this event.');
      }
  
      // Добавление пользователя в список участников мероприятия
      event.participants.push({ id: userId, name: user.name });
      await event.save();
  
      // Добавление мероприятия в список посещений пользователя
    //  console.log(event.date, "-event.date,", ctx.session.selectedGroup, '-ctx.session.selectedGroup,',  ctx.session.nextEvent, '- ctx.session.nextEvent' )
      user.visits.push({
        date: event.date,
        groupId: ctx.session.selectedGroup,
        eventId: ctx.session.nextEvent
      });
      await user.save();
      await ctx.reply('You are added to the event!');
    } catch (error) {
      console.error('Error adding user to event:', error);
      await ctx.reply('Sorry, there was an error adding you to the event.');
    }
  });
  
  bot.hears('no', async (ctx) => {
    console.log('No received');
    try {
        const userId = ctx.from.id.toString();
        console.log('User ID:', userId);
        const user = await User.findOne({ telegramId: userId }).exec();
        if (!user) {
            console.log('User not found');
            return ctx.reply('User not found');
        }

        console.log('Selected Group ID from session:', ctx.session.selectedGroup);
        const group = await Group.findById(ctx.session.selectedGroup).exec();
        if (!group) {
            console.log('Group not found');
            return ctx.reply('Group not found');
        }

        console.log('Next Event ID from session:', ctx.session.nextEvent);
        const event = await Event.findById(ctx.session.nextEvent);
        if (!event) {
            console.log('Event not found');
            return ctx.reply('Event not found');
        }
console.log(event, 'event')
        // Удаление пользователя из списка участников мероприятия, если он там есть
        event.participants = event.participants.filter(p => p.id !== userId);
        await event.save();
        console.log('User removed from event participants');

        // Удаление мероприятия из списка посещений пользователя, если оно там есть
        user.visits = user.visits.filter(v => v.eventId !== event._id.toString());
        await user.save();
        console.log('Event removed from user visits');

        await ctx.reply('You have been removed from the event.');
    } catch (error) {
        console.error('Error removing user from event:', error);
        await ctx.reply('Sorry, there was an error removing you from the event.');
    }
});

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
    console.log('Message received:', ctx.message.text);
    try {
        if (ctx.session.registrationStep === 1) {

            ctx.session.registrationName = ctx.message.text; //// имя

            ctx.session.registrationStep = 2;

            await ctx.reply('Please enter your password:');

        } else if (ctx.session.registrationStep === 2) {

            ctx.session.registrationPassword = ctx.message.text;//// пароль

            ctx.session.registrationStep = 3;

            await ctx.reply('Confirm your registration by typing "confirm"');

        } else if (ctx.session.registrationStep === 3 && ctx.message.text.toLowerCase() === 'confirm') {

            // Проверка наличия пользователя с таким Telegram ID
            const existingUserByTelegramId = await User.findOne({ telegramId: ctx.from.id.toString() });

            if (existingUserByTelegramId) {
                await ctx.reply('A user with this Telegram ID already exists.');
                ctx.session = {}; // Очистить сессию
                return;
            }

            const hashedPassword = await bcrypt.hash(ctx.session.registrationPassword, 10);

                const user = new User({
                    telegramId: ctx.from.id.toString(),
                    name: ctx.session.registrationName,
                    password: hashedPassword,
                    groups: [],
                    createdAt: new Date(),
                });

                await user.save();
                await ctx.reply('Registration successful!');
                ctx.session = {}; // Очистить сессию
            } else {
                await ctx.reply('Invalid token. Please try again.');
            }
    } catch (error) {
        console.error('Error processing registration step:', error);
        await ctx.reply('Sorry, there was an error processing your request.');
    }
});


// Обработка нажатий на кнопки выбора групп
bot.on('callback_query:data', async (ctx) => {
    console.log('Callback query received:', ctx.callbackQuery.data);
    try {
        const groupId = ctx.callbackQuery.data;

            console.log('Selected group ID:', groupId);

            const events = await Event.find({group: groupId}).exec();
            if (!events) {
                return ctx.reply('Events not found');
            }

            const today = moment();
            const event = events.filter(event => !event.isCancelled && moment(event.date).isAfter(today));

            if (events.length === 0) {
                return ctx.reply('No upcoming events found');
            }

            const nextEvent = events.sort((a, b) => moment(a.date) - moment(b.date))[0];
            const eventDate = moment(nextEvent.date).format('YYYY-MM-DD');
            const eventTime = moment(nextEvent.date).format('HH:mm');

            ctx.session.selectedGroup = groupId;
            ctx.session.nextEvent = nextEvent._id;

            await ctx.reply(`The next event is on ${eventDate} at ${eventTime}. Will you go to this event?`, {
                reply_markup: new Keyboard()
                    .text('yes')
                    .text('no')
                    .resized()
                    .oneTime(),
            });
        
    } catch (error) {
        console.error('Error handling callback query:', error);
        await ctx.reply('Sorry, there was an error processing your request.');
    }
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
        command: 'groups',
        description: 'Choose your group',
    },
    {
        command: 'register',
        description: 'Start registration',
    },
    {
        command: 'start',
        description: 'Start the bot',
    },
    {
        command: 'payment',
        description: 'Check your monthly payment status',
    },
]);

bot.start();
