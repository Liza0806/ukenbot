const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require('bcryptjs');
const { handleMongooseError } = require("../helpers/handleMongooseError");

const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;

const visitSchema = new mongoose.Schema({
  date: { type: String, required: true },
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
    discount: {
      type: Number,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    createdAt: {
      type: Date,
      required: false,
    },
    updatedAt: {
      type: Date,
      required: false,
    },
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleMongooseError);

const addVisit = Joi.object({
  date: Joi.string().isoDate().required(),
  groupId: Joi.string().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().pattern(phoneRegexp).required(),
  telegramId: Joi.number().required(),
  groups: Joi.array().default([]),
  balance: Joi.number().default(0),
  isAdmin: Joi.boolean().default(false),
  visits: Joi.array().default([]),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().optional(),
});
const updateSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  phone: Joi.string().pattern(phoneRegexp),
  groups: Joi.array(),
  telegramId: Joi.number(),
  isAdmin: Joi.boolean(),
  balance: Joi.number(),
  visits: Joi.array(),
  password: Joi.string().min(6),
  discount: Joi.number(),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const loginSchema = Joi.object({
  password: Joi.string().required(),
});

const schemas = {
  registerSchema,
  updateSchema,
  loginSchema,
  addVisit,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
