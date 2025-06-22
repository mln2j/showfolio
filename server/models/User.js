const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String},
    photoUrl: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
