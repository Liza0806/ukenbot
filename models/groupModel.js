const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const Joi = require("joi");

const scheduleSchema = new Schema({
  _id: {
    type: String,
  },
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const participantsSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  discount: { type: Number, required: false },
});

// const paymentSchema = new Schema ({
//   _id: {
//     type: String,
//     required: false
//   },
//   // dailyPayment: {
//   //   type: Number,
//   //   required: false,
//   //   default: 0
//   // },
//   // monthlyPayment: {
//   //   type: Number,
//   //   required: false,
//   //   default: 0
//   // },
// })

const groupSchema = new Schema(
  {
    // _id: {
    //   type: String,
    //   required: false
    // },
    title: {
      type: String,
      required: [true, "Set name for the group"],
      default: "newGroupTitle",
    },
    coachId: {
      type: String,
      default: "Kostya",
    },
    dailyPayment: {
      type: Number,
      required: false,
      default: 0,
    },
    monthlyPayment: {
      type: Number,
      required: false,
      default: 0,
    },
    schedule: [scheduleSchema],
    participants: [participantsSchema],
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

const scheduleSchemaJoi = Joi.object({
  _id: Joi.string(),
  day: Joi.string().required(),
  time: Joi.string().required(),
});
// const paymentSchemaJoi = Joi.object({
//   _id: Joi.string(),
//   dailyPayment: Joi.number().allow('').default('0'),
//   monthlyPayment: Joi.number().allow('').default('0'),

// });

const participantsSchemaJoi = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  telegramId: Joi.number().required(),
  discount: Joi.number(),
});
const addGroupSchema = Joi.object({
  // _id: Joi.string(),
  title: Joi.string().default("newGroupTitle").required(),
  coachId: Joi.string().default("Kostya"),
  dailyPayment: Joi.number().allow("").default("0"),
  monthlyPayment: Joi.number().allow("").default("0"),
  schedule: Joi.array().items(scheduleSchemaJoi).default([]),
  participants: Joi.array().items(participantsSchemaJoi).default([]),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const updateGroupPriceSchema = Joi.object({
  dailyPayment: Joi.number().allow("").default("0"),
  monthlyPayment: Joi.number().allow("").default("0"),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

const updateGroupparticipantsSchema = Joi.object({
  participants: Joi.array().items(participantsSchemaJoi).default([]),
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
  schemas,
};
