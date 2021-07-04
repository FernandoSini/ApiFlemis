const mongoose = require('mongoose');
const { ObjectId } = mongoose.schema;

const imageSchema = new Mongoose.schema({

    imageInfo:{
        data:buffer,
        contentType:String,
    },
    uploadedBy: {
        type: ObjectId,
        ref:"User"
    },
});

module.exports = mongoose.model('Image',imageSchema)