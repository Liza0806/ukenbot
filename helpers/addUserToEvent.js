const { User } = require("../models/userModel");

// Функция для добавления пользователя в событие
async function addUserToEvent(user, event, groupId) {
  if (!user || !event || !event.participants || !user.visits) {
    throw new Error("Некорректные данные: отсутствуют обязательные поля.");
  }

  const userId = user.telegramId.toString();

  // Проверяем, участвует ли пользователь уже в событии
  const isAlreadyParticipant = event.participants.find((p) => p.id === userId);
  if (isAlreadyParticipant) {
    return { success: false, message: "Пользователь уже участвует в событии." };
  } else {
    // Добавляем пользователя в список участников события
    event.participants.push({
      telegramId: user.telegramId,
      name: user.name,
      id: user._id,
    });
  }

  const isAlreadyInVisits = user.visits.find((v) => v.eventId === event._id);
  if (isAlreadyInVisits) {
    return { success: false, message: "Пользователь уже участвует в событии." };
  } else {
    // Добавляем посещение в список пользователя
    user.visits.push({
      date: event.date,
      groupId: groupId,
      eventId: event._id,
    });
  }

  try {
    // Сохраняем изменения
    await Promise.all([event.save(), user.save()]);
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error);
    throw new Error("Не удалось сохранить данные пользователя или события.");
  }

  return { success: true, message: "Пользователь успешно добавлен в событие." };
}

module.exports = addUserToEvent;
