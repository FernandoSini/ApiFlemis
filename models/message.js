const mongoose = require("mongoose")
const uuidv1 = require("uuidv1") //caso dê algum erro no uuid, deve trocar const por let ou então tentar essa solução const { v1: uuidv1 } = require('uuid');
const crypto = require("crypto") //modulo responsavel por encriptografar as senhas
const { type } = require("os");
const { ObjectId } = mongoose.Schema;
// const Post = require('./post')
//teste pra poder adicionar no git
const messageSchema = new mongoose.Schema({

    from: {
        type: ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true
    },
    target: {
        type: ObjectId,
        ref: "User"
    }

});


module.exports = mongoose.model("Message", messageSchema);