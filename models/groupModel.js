const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../handleMongooseError");

const Joi = require("joi");

const validDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

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
    type: Number,
    required: false,
    default: 0
  },
  monthlyPayment: {
    type: Number,
    required: false,
    default: 0
  }
})

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
});

const scheduleSchemaJoi = Joi.object({
  day: Joi.string().required(),
  time: Joi.string().required(),
});
const paymentSchemaJoi = Joi.object({
  dailyPayment: Joi.string().allow('').default('0'),
  monthlyPayment: Joi.string().allow('').default('0'),
});


const addGroupSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().default('newGroupTitle'),
  coachId: Joi.string().default('Kostya'),
  payment: Joi.array().items(paymentSchemaJoi).default([]),
  schedule: Joi.array().items(scheduleSchemaJoi).default([]),
});

const updateGroupPriceSchema = Joi.object({
  payment: Joi.array().items(paymentSchemaJoi).default([]),
});


const updateGroupScheduleSchema = Joi.object({
  schedule: Joi.array().items(scheduleSchemaJoi).default([]),
});

groupSchema.post("save", handleMongooseError);

const Group = model("group", groupSchema);

const schemas = {
  addGroupSchema,
  updateGroupScheduleSchema,
  updateGroupPriceSchema,
};
module.exports = {
  Group,
  schemas
};
