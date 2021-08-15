const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

const inviteSchema = new Mongoose.Schema({

    sentBy: {
        type: ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true,
        required: true

    },
    to: {
        type: ObjectId,
        ref: "User"
    }

})



module.exports = mongoose.model("Invite", inviteSchema);