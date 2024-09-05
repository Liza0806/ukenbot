const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;

const visitSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  groupId: { type: String, required: true },
  eventId: { type: String, required: true },
});
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: [true, "Set password for user"] },
    phone: {
      type: String,
      match: phoneRegexp,
    },
    isAdmin: { type: Boolean, default: false },
    groups: { type: Array, default: [] }, ///
    balance: {
      type: Number,
      default: 0,
    },
    visits: [visitSchema],
    telegramId: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);
const User = model("user", userSchema);
module.exports = { User };
