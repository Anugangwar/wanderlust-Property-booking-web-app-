const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const User = new Schema ({
            email: {

                  type: String,
                  required: true,
                 },
    });
User.plugin(passportLocalMongoose.default); //here we are add only email because passport-local-mongoose add username, passwordbydefault

module.exports = mongoose.model('User', User);