const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");
const Joi = require("joi");

const paymentSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ["cash", "card", "bank_transfer", "other"],
    required: true,
  },
  status: {
    type: String,
    enum: ["paid", "pending", "overdue"],
    default: "pending",
  },
  groupId: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
  discount: {
    type: Number,
    default: 0,
  },
  coach: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
});

paymentSchema.post("save", handleMongooseError);

const Payment = model("Payment", paymentSchema);

const paymentValidationSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  date: Joi.date().default(() => new Date()),
  method: Joi.string()
    .valid("cash", "card", "bank_transfer", "other")
    .required(),
  status: Joi.string().valid("paid", "pending", "overdue").default("pending"),
  groupId: Joi.string().required(),
  period: Joi.string().required(), // "Август 2024"
  comment: Joi.string().allow("").optional(),
  discount: Joi.number().min(0).default(0),
  coach: Joi.string().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
});

module.exports = { Payment, paymentValidationSchema };
