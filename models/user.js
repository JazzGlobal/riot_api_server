var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
    // TODO: Implement Validation.
    email: {
        type: String, 
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        min: 8
    }
})
UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema)