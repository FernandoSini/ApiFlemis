const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

//teste para poder adicionar no git
const matchSchema = new mongoose.Schema({

    user1: {
        type: ObjectId,
        ref: "User",
    },
    user2: {
        type: ObjectId,
        ref: "User",
    },

})


module.exports = mongoose.model('Match', matchSchema)