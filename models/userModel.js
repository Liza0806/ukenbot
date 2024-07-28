const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../handleMongooseError");


const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;


  const visitSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    groupId: { type: String, required: true },
    eventId: { type: String, required: true }
  });
  const userSchema = new Schema(
    {
      name: { type: String, required: true },
      email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
      },
      password: { type: String, required: [true, "Set password for user"] },
      phone: {
        type: String,
        match: phoneRegexp,
      },
      isAdmin: { type: Boolean, default: false },
      groups: { type: Array, required: true }, ///
      visits: [visitSchema],
      avatarURL: {
        type: String,
        required: false,
      },
      verify: {
        type: Boolean,
        default: false,
      },
      verificationCode: {
        type: String,
        required: [true, "Verify token is required"],
      },
      token: {
        type: String,
        default: null
      },
      telegramId: {
       type: Number,
       required: true
      }
    },
    { versionKey: false, timestamps: true }
  );
 //  userSchema.post("save", handleMongooseError);
  const User = model("user", userSchema);
  module.exports = { User };