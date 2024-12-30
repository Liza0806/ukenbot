// Функция для получения группы по id
const { Group } = require("../models/groupModel");

async function getGroupById(groupId) {
    return Group.findById(groupId).exec();
  }

  module.exports = getGroupById;