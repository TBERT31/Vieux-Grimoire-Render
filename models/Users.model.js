const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true}, // Les adresses électroniques dans la base de données sont uniques 
    password: {type: String, required: true} 
});

userSchema.plugin(uniqueValidator); // Un plugin Mongoose approprié est utilisé pour garantir leur unicité et signaler les erreurs.

module.exports = mongoose.model('User', userSchema);