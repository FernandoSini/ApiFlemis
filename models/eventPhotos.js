const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { ObjectId } = mongoose.Schema;


const eventPhotosSchema = new mongoose.Schema({

    refUser: {
        type: ObjectId,
        ref: "User",
    },
    contentType: {
        type: String,
        trim: true
    },
    path: {
        type: String,
        trim: true
    },
    filename: {
        type: String,
        trim: true
    },
    refEvent: {
        type: ObjectId,
        ref: "Event"
    }

})

module.exports = mongoose.model("EventPhoto", eventPhotosSchema)