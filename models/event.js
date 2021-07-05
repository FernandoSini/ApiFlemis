const mongoose = require("mongoose")
const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { ObjectId } = mongoose.Schema;


const eventSchema = new mongoose.Schema({

    owner:{
        type: ObjectId,
        ref:"EventOwner"
    },
    users:[{
        type:ObjectId,
        ref:"User",
    }]
})

module.exports = mongoose.model("Event", eventSchema)