const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");
const Joi = require("joi");

const eventSchema = new Schema(
  {
    _id: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: true,
    },
    groupTitle: {
      type: String,
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    participants: {
      type: [
        {
          _id: String,
          name: String,
          telegramId: Number,
          discount: { type: Number, required: false },
        },
      ],
      required: true,
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
  { timestamps: true }
); 

const Event = model("event", eventSchema);

const participantsSchemaJoi = Joi.object({
  name: Joi.string().required(),
  _id: Joi.string().required(),
  telegramId: Joi.number(),
  discount: Joi.number(),
});

const eventSchemaJoi = Joi.object({
  _id: Joi.string(),
  date: Joi.string().isoDate().required(),
  groupTitle: Joi.string().required(),
  groupId: Joi.string().required(),
  isCancelled: Joi.boolean().default(false),
  participants: Joi.array().items(participantsSchemaJoi).default([]),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const updateEventSchemaJoi = Joi.object({
  _id: Joi.string().required(),
  date: Joi.string().isoDate().required(),
  groupTitle: Joi.string().required(),
  groupId: Joi.string().required(),
  isCancelled: Joi.boolean().default(false),
  participants: Joi.array().items(participantsSchemaJoi).default([]),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const schemas = {
  eventSchemaJoi,
  updateEventSchemaJoi,
};

module.exports = {
  Event,
  schemas,
};
