const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");
const Joi = require('joi'); 

const eventSchema = new Schema({
    // _id: {
    //     type: String, 
    //     required: false
    // },
    date: {
        type: String,
        required: true
    },
    groupTitle: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    participants: {
        type: [{ id: String, name: String, telegramId: String }],
        required: true
    }
}, { timestamps: true }); // timestamps добавлены как опция схемы

const Event = model('event', eventSchema);

const participantsSchemaJoi = Joi.object({
    name: Joi.string().required(),
    id: Joi.string().required(),
    telegramId: Joi.string()
});

const eventSchemaJoi = Joi.object({
    //_id: Joi.string().required(),
    date: Joi.string().isoDate().required(),
    groupTitle: Joi.string().required(),
    groupId: Joi.string().required(),
    isCancelled: Joi.boolean().default(false), 
    participants: Joi.array().items(participantsSchemaJoi).default([]),
});
const updateEventSchemaJoi = Joi.object({
    _id: Joi.string().required(),
    date: Joi.string().isoDate().required(),
    groupTitle: Joi.string().required(),
    groupId: Joi.string().required(),
    isCancelled: Joi.boolean().default(false), 
    participants: Joi.array().items(participantsSchemaJoi).default([]),
});

const schemas = {
    eventSchemaJoi,
    updateEventSchemaJoi
};

module.exports = {
    Event,
    schemas
};