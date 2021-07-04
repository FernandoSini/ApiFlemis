const mongoose = require('mongoose')
const { ObjectId } = mongoose.schema

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


module.exports = mongoose.model('Match', matchSchema)