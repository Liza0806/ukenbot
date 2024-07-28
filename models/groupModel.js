const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

const scheduleSchema = new Schema({
    day: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  });
  const paymentSchema = new Schema ({
    dailyPayment: {
      type: String,
      required: false,
      default: 0
    },
    monthlyPayment: {
      type: String,
      required: false,
      default: 0
    }
  })
  
  const eventSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    participants: {
      type: [{ id: String, name: String }], // Массив объектов для хранения ID и имен участников
      required: true
    },
    _id: {
      type: String, 
      required: true
    }
  });
 
  const groupSchema = new Schema({
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Set name for the group"],
      default: "newGroupTitle",
    },
    coachId: {
      type: String,
      required: true,
      default: "Kostya"
    },
  payment: [paymentSchema],
  schedule: [scheduleSchema],
  events: [eventSchema]
  });
  const Group = model("group", groupSchema);
  module.exports = { Group };