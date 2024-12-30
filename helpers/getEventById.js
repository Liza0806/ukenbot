// Функция для получения события по id
const { Event } = require("../models/eventModel");

async function getEventById(eventId) {
  return Event.findById(eventId).exec();
}

module.exports = getEventById;
