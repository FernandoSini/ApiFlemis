const mongoose = require('mongoose')
const { ObjectId } = mongoose.schema

//teste para poder adicionar no git
const matchSchema = new mongoose.schema({

    user1: {
        type: ObjectId,
        ref: "User",
    },
    user2: {
        type: ObjectId,
        ref: "User",
    },

})


module.exports = mongoose.model('Matches', matchSchema)