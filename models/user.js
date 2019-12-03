var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    // TODO: Implement Validation.
    username: {
        type: String, 
        unique: true,
        required: true
    },
    email: {
        type: String, 
        unique: true,
        required: true
    },
    password: {
        type: String,
    }
})
UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema)