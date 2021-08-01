const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { ObjectId } = mongoose.Schema;


const eventSchema = new mongoose.Schema({

    event_owner: {
        type: ObjectId,
        ref: "User"
    },
    event_name: {
        type: String,
        trim: true,
    },
    event_cover: {
        data: buffer,
        contentType: String,
    },
    event_location: {
        type: Stirng,
        trim: true,
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date
    },
    users: [{
        type: ObjectId,
        ref: "User",
    }],
    event_status: {
        type: String,
        enum: ["INCOMING", "HAPPENING", "ENDED"],
        default: "INCOMING",
    },
    eventPhotos: [{
        type: ObjectId,
        ref: "EventPhoto",
    }]
})

module.exports = mongoose.model("Event", eventSchema)