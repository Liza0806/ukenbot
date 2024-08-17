const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../handleMongooseError");
const Joi = require('joi'); 

const eventSchema = new Schema({
    _id: {
        type: String, 
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    participants: {
        type: [{ id: String, name: String }],
        required: true
    }
}, { timestamps: true });

const Event = model('event', eventSchema);

const participantsSchemaJoi = Joi.object({
    name: Joi.string().required(),
    id: Joi.string().required(),
});

const addEventSchema = Joi.object({
    _id: Joi.string().required(),
    date: Joi.date().required(), 
    group: Joi.string().required(),
    isCancelled: Joi.boolean().default(false), 
    participants: Joi.array().items(participantsSchemaJoi).default([]),
});
// const addUserSchema = Joi.object({
//     _id: Joi.string().required(),
//     date: Joi.date().required(), 
//     group: Joi.string().required(),
//     isCancelled: Joi.boolean().default(false), 
//     participants: Joi.array().items(participantsSchemaJoi).default([]),
// });
const schemas = {
    addEventSchema
};

module.exports = {
    Event,
    schemas
};
