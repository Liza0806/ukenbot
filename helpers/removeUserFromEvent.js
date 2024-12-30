// Функция для добавления пользователя в событие

async function removeUserFromEvent(user, event) {
  const userId = user.telegramId.toString();

  event.participants = event.participants.filter(
    (p) => p.telegramId !== userId
  );
  await event.save();

  user.visits = user.visits.filter((v) => v.eventId !== event._id);
  await user.save();

  return true;
}

module.exports = removeUserFromEvent;
